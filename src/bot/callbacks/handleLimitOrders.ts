import { TransactionStatus } from '@prisma/client/edge';

import logger from '@/config/logger';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { TransactionsService } from '@/services/prisma/transactions';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import { GasPriority } from '@/types/config';
import { LimitOrderParams } from '@/types/neurodex';
import { LimitOrderAssetData } from '@/types/openocean';
import { BotContext } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { getOpenOceanLimitOrderLink, shortenHash } from '@/utils/formatters';
import { validateUser } from '@/utils/userValidation';
import { validatePK } from '@/utils/validators';

import {
  limitConfirmKeyboard,
  limitExpiryKeyboard,
  limitTargetTokenKeyboard,
} from '../commands/limit';
import { startKeyboard } from '../commands/start';

// limit token callback
export async function limitToken(ctx: BotContext): Promise<void> {
  await validateUser(ctx);

  ctx.session.currentOperation = { type: 'limit' };

  await ctx.reply(ctx.t('limit_token_msg'), {
    parse_mode: 'Markdown',
  });
}

// retrieve limit amount callback
export async function retrieveLimitAmount(ctx: BotContext, amount: string): Promise<void> {
  await validateUser(ctx);
  const { currentOperation } = ctx.session;

  if (!currentOperation?.token) {
    const message = await ctx.reply(ctx.t('invalid_token_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // custom amount
  if (amount === 'custom') {
    await ctx.reply(ctx.t('limit_custom_amount_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    const message = await ctx.reply(ctx.t('invalid_amount_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  ctx.session.currentOperation = {
    ...currentOperation,
    amount: parsedAmount,
  };

  // Ask for target token (what user wants to receive)
  await ctx.reply(ctx.t('limit_target_token_msg'), {
    parse_mode: 'Markdown',
    reply_markup: limitTargetTokenKeyboard,
  });
}

// retrieve limit target token callback
export async function retrieveLimitTargetToken(
  ctx: BotContext,
  targetAddress: string
): Promise<void> {
  await validateUser(ctx);
  const { currentOperation } = ctx.session;

  if (!currentOperation || currentOperation.type !== 'limit' || !currentOperation.amount) {
    await ctx.reply(ctx.t('limit_restart_msg'));
    return;
  }

  // custom target token
  if (targetAddress === 'custom') {
    await ctx.reply(ctx.t('limit_custom_target_token_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  }

  // Map of known token addresses to their symbols and names
  const knownTokens: Record<string, { symbol: string; name: string }> = {
    '0x4200000000000000000000000000000000000006': { symbol: 'WETH', name: 'Wrapped Ether' },
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': { symbol: 'USDC', name: 'USD Coin' },
    '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2': { symbol: 'USDT', name: 'Tether USD' },
    '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb': { symbol: 'DAI', name: 'Dai Stablecoin' },
  };

  const tokenInfo = knownTokens[targetAddress];
  if (!tokenInfo) {
    // For unknown tokens, fetch from API
    const neurodex = new NeuroDexApi();
    const tokenData = await neurodex.getTokenDataByContractAddress(targetAddress, 'base');

    if (!tokenData.success || !tokenData.data) {
      const message = await ctx.reply(ctx.t('token_not_found_msg'), {
        parse_mode: 'Markdown',
      });
      await deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    ctx.session.currentOperation = {
      ...currentOperation,
      targetToken: targetAddress,
      targetTokenSymbol: tokenData.data.symbol,
      targetTokenName: tokenData.data.name,
    };
  } else {
    ctx.session.currentOperation = {
      ...currentOperation,
      targetToken: targetAddress,
      targetTokenSymbol: tokenInfo.symbol,
      targetTokenName: tokenInfo.name,
    };
  }

  await ctx.reply(ctx.t('limit_price_msg'), {
    parse_mode: 'Markdown',
  });
}

export async function retrieveLimitPrice(ctx: BotContext, price: string): Promise<void> {
  const { currentOperation } = ctx.session;
  if (
    !currentOperation ||
    currentOperation.type !== 'limit' ||
    !currentOperation.amount ||
    !currentOperation.targetToken
  ) {
    await ctx.reply(ctx.t('limit_restart_msg'));
    return;
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    const message = await ctx.reply(ctx.t('limit_invalid_price_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  ctx.session.currentOperation = {
    ...currentOperation,
    price: parsedPrice,
  };

  await ctx.reply(ctx.t('limit_expiry_msg'), {
    parse_mode: 'Markdown',
    reply_markup: limitExpiryKeyboard,
  });
}

export async function retrieveLimitExpiry(ctx: BotContext, expiry: string): Promise<void> {
  const user = await validateUser(ctx);
  const { currentOperation } = ctx.session;
  if (
    !currentOperation ||
    currentOperation.type !== 'limit' ||
    !currentOperation.price ||
    !currentOperation.targetToken
  ) {
    await ctx.reply(ctx.t('limit_restart_msg'));
    return;
  }

  let expiryValue: string;
  if (expiry === 'custom') {
    await ctx.reply(ctx.t('limit_custom_expiry_msg'));
    return;
  } else {
    expiryValue = expiry;
  }

  ctx.session.currentOperation = {
    ...currentOperation,
    expiry: expiryValue,
  };

  // Calculate total value for confirmation
  const amount = currentOperation.amount ?? 0;
  const price = currentOperation.price ?? 0;
  const totalValue = (amount * price).toFixed(6);

  // Estimate gas fees
  const neurodex = new NeuroDexApi();
  const feeInfo = {
    gasEth: '',
    gasUsd: '',
    feeEstimationFailed: false,
  };

  try {
    const feeEstimation = await neurodex.estimateLimitOrderFee(
      {
        fromTokenAddress: currentOperation.token || '',
        toTokenAddress: currentOperation.targetToken,
        fromAmount: amount,
        toAmount: amount * price,
        walletAddress: user.wallets[0].address,
        gasPriority: (user?.settings?.gasPriority as GasPriority) || 'standard',
      },
      'base'
    );

    if (feeEstimation.success && feeEstimation.data) {
      feeInfo.gasEth = feeEstimation.data.gasEth;
      feeInfo.gasUsd = feeEstimation.data.gasUsd;
    } else {
      logger.warn('Fee estimation failed:', feeEstimation.error);
      feeInfo.feeEstimationFailed = true;
    }
  } catch (error) {
    logger.error('Error during fee estimation:', error);
    feeInfo.feeEstimationFailed = true;
  }

  // Show confirmation message with both tokens and fee information
  const message = ctx.t('limit_confirm_msg', {
    token: currentOperation.token || '',
    tokenSymbol: currentOperation.tokenSymbol || '',
    tokenName: currentOperation.tokenName || '',
    targetTokenSymbol: currentOperation.targetTokenSymbol || '',
    targetTokenName: currentOperation.targetTokenName || '',
    amount: amount,
    price: price,
    totalValue: totalValue,
    expiry: expiryValue,
    gasEth: feeInfo.gasEth,
    gasUsd: feeInfo.gasUsd,
    feeEstimationFailed: feeInfo.feeEstimationFailed ? 'true' : 'false',
  });

  await ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: limitConfirmKeyboard,
  });
}

// confirm limit order
export async function confirmLimitOrder(ctx: BotContext): Promise<void> {
  const user = await validateUser(ctx);
  const { currentOperation } = ctx.session;

  const privateKey = await PrivateStorageService.getPrivateKey(user.wallets[0].address);
  if (!privateKey || !(await validatePK(ctx, privateKey))) return;

  if (
    !currentOperation?.amount ||
    !currentOperation?.price ||
    !currentOperation?.token ||
    !currentOperation?.expiry ||
    !currentOperation?.targetToken
  ) {
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // Calculate the amount of target token to receive based on price
  const toAmount = currentOperation.amount * currentOperation.price;

  const params: LimitOrderParams = {
    fromTokenAddress: currentOperation.token, // Token to sell
    toTokenAddress: currentOperation.targetToken, // User-selected target token
    fromAmount: currentOperation.amount,
    toAmount: toAmount,
    expire: currentOperation.expiry,
    slippage: Number(user?.settings?.slippage) || 1,
    gasPriority: (user?.settings?.gasPriority as GasPriority) || 'standard',
    walletAddress: user.wallets[0].address,
    privateKey: privateKey,
    referrer: '0x8159F8156cD0F89114f72cD915b7b4BD7e83Ad4D',
  };

  // Create pending transaction record
  let transaction;
  try {
    transaction = await TransactionsService.createLimitOrderTransaction(
      user.id,
      user.wallets[0].id,
      {
        chain: 'base',
        tokenInAddress: currentOperation.token, // Token to sell
        tokenInSymbol: currentOperation.tokenSymbol || 'TOKEN',
        tokenInAmount: currentOperation.amount,
        tokenOutAddress: currentOperation.targetToken, // User-selected target token
        tokenOutSymbol: currentOperation.targetTokenSymbol || 'TOKEN',
        tokenOutAmount: toAmount,
        expire: currentOperation.expiry,
        status: TransactionStatus.PENDING,
      }
    );
    logger.info('Created pending limit order transaction:', transaction.id);
  } catch (error) {
    logger.error('Error creating transaction record:', error);
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  const neurodex = new NeuroDexApi();
  const result = await neurodex.createLimitOrder(params, 'base');
  logger.info('LIMIT ORDER RESULT:', result);

  if (result.success && result.data) {
    // Extract order hash from result
    const orderHash = result.data.orderHash || '';
    const shortOrderHash = shortenHash(orderHash, 10, 8);
    const openOceanLink = getOpenOceanLimitOrderLink('base');

    // Update transaction with success status and order hash
    await TransactionsService.updateTransactionStatus(
      transaction.id,
      TransactionStatus.COMPLETED,
      orderHash
    );

    const message = ctx.t('limit_order_created_msg', {
      tokenSymbol: currentOperation?.tokenSymbol || '',
      targetTokenSymbol: currentOperation?.targetTokenSymbol || '',
      amount: currentOperation.amount,
      price: currentOperation.price,
      expiry: currentOperation.expiry,
      orderHash: orderHash,
      shortOrderHash: shortOrderHash,
      openOceanLink: openOceanLink,
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      link_preview_options: {
        is_disabled: true,
      },
    });
    ctx.session.currentOperation = null;
  } else {
    // Update transaction with failed status
    await TransactionsService.updateTransactionStatus(transaction.id, TransactionStatus.FAILED);

    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    ctx.session.currentOperation = null;
  }
}

// cancel limit order
export async function limitCancel(ctx: BotContext): Promise<void> {
  await validateUser(ctx);

  // reset operation
  ctx.session.currentOperation = null;

  // Send cancel message
  const cancelMessage = await ctx.reply(ctx.t('limit_cancel_msg'));
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await ctx.api.deleteMessage(cancelMessage.chat.id, cancelMessage.message_id);

  // send start message
  await ctx.reply(ctx.t('start_msg'), {
    parse_mode: 'Markdown',
    reply_markup: startKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

// cancel limit order
export async function cancelLimitOrder(ctx: BotContext, orderHash: string): Promise<void> {
  const user = await validateUser(ctx);

  const privateKey = await PrivateStorageService.getPrivateKey(user.wallets[0].address);
  if (!privateKey) {
    const message = await ctx.reply(ctx.t('no_private_key_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  const neurodex = new NeuroDexApi();

  // First get the order details
  const ordersResult = await neurodex.getLimitOrders(
    {
      address: user.wallets[0].address,
      statuses: [1, 3, 5], // Active orders
    },
    'base'
  );

  if (!ordersResult.success || !ordersResult.data) {
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  const orderToCancel = ordersResult.data.find((order) => order.orderHash === orderHash);
  if (!orderToCancel) {
    const message = await ctx.reply(ctx.t('limit_order_not_found_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // Cancel the order
  const result = await neurodex.cancelLimitOrder(
    {
      orderHash: orderHash,
      orderData: {} as LimitOrderAssetData,
      slippage: Number(user?.settings?.slippage) || 1,
      gasPriority: (user?.settings?.gasPriority as GasPriority) || 'standard',
      walletAddress: user.wallets[0].address,
      privateKey: privateKey,
      referrer: '0x8159F8156cD0F89114f72cD915b7b4BD7e83Ad4D',
    },
    'base'
  );

  if (result.success) {
    // Update transaction status to canceled
    const transaction = await TransactionsService.getTransactionByOrderHash(orderHash);
    if (transaction) {
      await TransactionsService.updateTransactionStatus(transaction.id, TransactionStatus.CANCELED);
    }

    const message = ctx.t('limit_order_cancel_success_msg', {
      makerSymbol: orderToCancel.data.makerAssetSymbol,
      takerSymbol: orderToCancel.data.takerAssetSymbol,
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
    });
  } else {
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
  }
}

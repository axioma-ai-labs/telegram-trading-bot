import { TransactionStatus } from '@prisma/client/edge';
import { Address } from 'viem';

import {
  limitBuyAmountKeyboard,
  limitBuyConfirmKeyboard,
  limitExpiryKeyboard,
  limitPriceKeyboard,
  limitSellAmountKeyboard,
  limitSellConfirmKeyboard,
} from '@/bot/commands/limit';
import { startKeyboard } from '@/bot/commands/start';
import logger from '@/config/logger';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { ViemService } from '@/services/engine/viem';
import { TransactionsService } from '@/services/prisma/transactions';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import { GasPriority } from '@/types/config';
import { LimitOrderParams } from '@/types/neurodex';
import { LimitOrderAssetData } from '@/types/openocean';
import { BotContext, OperationState } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { validateUser } from '@/utils/userValidation';
import {
  getExpiryDescription,
  isValidAmount,
  validateExpiryTime,
  validatePK,
} from '@/utils/validators';

// ======================================================
// Type Selection Handlers
// ======================================================

/**
 * Handle limit order type selection (buy vs sell)
 */
export async function handleLimitType(ctx: BotContext, type: 'buy' | 'sell'): Promise<void> {
  await validateUser(ctx);

  ctx.session.currentOperation = {
    type: 'limit',
    subType: type,
  };

  if (type === 'buy') {
    await ctx.reply(ctx.t('limit_buy_token_msg'), {
      parse_mode: 'Markdown',
    });
  } else {
    await ctx.reply(ctx.t('limit_sell_token_msg'), {
      parse_mode: 'Markdown',
    });
  }
}

// ======================================================
// Token Selection & Validation
// ======================================================

/**
 * Handle token address input for limit orders
 */
export async function handleLimitTokenInput(ctx: BotContext, tokenAddress: string): Promise<void> {
  const user = await validateUser(ctx);
  const { currentOperation } = ctx.session;

  if (!currentOperation || currentOperation.type !== 'limit' || !currentOperation.subType) {
    await ctx.reply(ctx.t('limit_restart_msg'));
    return;
  }

  try {
    // Get token data
    const neuroDex = new NeuroDexApi();
    const tokenData = await neuroDex.getTokenDataByContractAddress(tokenAddress, 'base');

    if (!tokenData.success || !tokenData.data) {
      const message = await ctx.reply(ctx.t('token_not_found_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    // For sell orders, check if user has balance
    if (currentOperation.subType === 'sell') {
      const viemService = new ViemService();
      const balance = await viemService.getTokenBalance(
        tokenAddress as Address,
        user.wallets[0].address as Address
      );

      if (!balance || balance === '0') {
        const message = await ctx.reply(
          ctx.t('limit_sell_no_balance_msg', {
            tokenSymbol: tokenData.data.symbol,
          })
        );
        deleteBotMessage(ctx, message.message_id, 10000);
        return;
      }

      // Store balance for later use
      ctx.session.currentOperation = {
        ...currentOperation,
        token: tokenAddress,
        tokenSymbol: tokenData.data.symbol,
        tokenName: tokenData.data.name,
        tokenPrice: tokenData.data.price,
        tokenBalance: balance,
      };

      // Show token found message and proceed to amount selection
      const message = ctx.t('limit_token_found_msg', {
        tokenSymbol: tokenData.data.symbol,
        tokenName: tokenData.data.name,
        tokenPrice: tokenData.data.price.toString(),
        tokenChain: 'Base',
        balance: balance,
      });

      const keyboard = limitSellAmountKeyboard;

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    } else {
      // For buy orders, just store token info
      ctx.session.currentOperation = {
        ...currentOperation,
        token: tokenAddress,
        tokenSymbol: tokenData.data.symbol,
        tokenName: tokenData.data.name,
        tokenPrice: tokenData.data.price,
      };

      // Show token found message and proceed to amount selection
      const message = ctx.t('limit_token_found_msg', {
        tokenSymbol: tokenData.data.symbol,
        tokenName: tokenData.data.name,
        tokenPrice: tokenData.data.price.toString(),
        tokenChain: 'Base',
      });

      const keyboard = limitBuyAmountKeyboard;

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    }
  } catch (error) {
    logger.error('Error handling limit token input:', error);
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
  }
}

// ======================================================
// Amount Selection Handlers
// ======================================================

/**
 * Handle buy amount selection
 */
export async function handleLimitBuyAmount(ctx: BotContext, amount: string): Promise<void> {
  await validateUser(ctx);
  const { currentOperation } = ctx.session;

  if (!currentOperation?.token || currentOperation.subType !== 'buy') {
    const message = await ctx.reply(ctx.t('invalid_token_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // Handle custom amount
  if (amount === 'custom') {
    await ctx.reply(ctx.t('limit_buy_custom_amount_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  }

  const parsedAmount = parseFloat(amount);
  if (!isValidAmount(parsedAmount)) {
    const message = await ctx.reply(ctx.t('invalid_amount_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  ctx.session.currentOperation = {
    ...currentOperation,
    fromAmount: parsedAmount, // ETH amount to spend
  };

  await ctx.reply(ctx.t('limit_buy_target_amount_msg'), {
    parse_mode: 'Markdown',
    reply_markup: limitPriceKeyboard,
  });
}

/**
 * Handle sell amount selection
 */
export async function handleLimitSellAmount(ctx: BotContext, amount: string): Promise<void> {
  await validateUser(ctx);
  const { currentOperation } = ctx.session;

  if (
    !currentOperation?.token ||
    currentOperation.subType !== 'sell' ||
    !currentOperation.tokenBalance
  ) {
    const message = await ctx.reply(ctx.t('invalid_token_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  let sellAmount: number;

  if (amount === 'custom') {
    await ctx.reply(ctx.t('limit_sell_custom_amount_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  } else if (amount.endsWith('%')) {
    // Handle percentage amounts
    const percentage = parseFloat(amount.replace('%', ''));
    const totalBalance = parseFloat(currentOperation.tokenBalance);
    sellAmount = (totalBalance * percentage) / 100;
  } else {
    sellAmount = parseFloat(amount);
  }

  if (!isValidAmount(sellAmount)) {
    const message = await ctx.reply(ctx.t('invalid_amount_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // Check if user has enough balance
  const totalBalance = parseFloat(currentOperation.tokenBalance);
  if (sellAmount > totalBalance) {
    const message = await ctx.reply(
      ctx.t('limit_sell_insufficient_balance_msg', {
        balance: totalBalance.toString(),
        tokenSymbol: currentOperation.tokenSymbol || 'TOKEN',
      })
    );
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  ctx.session.currentOperation = {
    ...currentOperation,
    fromAmount: sellAmount, // Token amount to sell
  };

  await ctx.reply(ctx.t('limit_sell_target_price_msg'), {
    parse_mode: 'Markdown',
  });
}

// ======================================================
// Price/Target Amount Handlers
// ======================================================

/**
 * Handle target amount for buy orders (how many tokens to get)
 */
export async function handleLimitBuyTargetAmount(
  ctx: BotContext,
  targetAmount: string
): Promise<void> {
  const { currentOperation } = ctx.session;

  if (!currentOperation || currentOperation.subType !== 'buy' || !currentOperation.fromAmount) {
    await ctx.reply(ctx.t('limit_restart_msg'));
    return;
  }

  let toAmount: number;

  if (targetAmount.startsWith('market_')) {
    // Handle market-based pricing
    const modifier = targetAmount.replace('market_', '').replace('_', '');
    const marketPrice = currentOperation.tokenPrice || 0;
    const ethAmount = currentOperation.fromAmount;

    let targetPrice = marketPrice;
    if (modifier === 'minus_5') targetPrice = marketPrice * 0.95;
    else if (modifier === 'minus_10') targetPrice = marketPrice * 0.9;
    else if (modifier === 'plus_5') targetPrice = marketPrice * 1.05;
    else if (modifier === 'plus_10') targetPrice = marketPrice * 1.1;

    toAmount = ethAmount / targetPrice;
  } else if (targetAmount === 'custom') {
    await ctx.reply(ctx.t('limit_buy_custom_target_amount_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  } else {
    toAmount = parseFloat(targetAmount);
  }

  if (!isValidAmount(toAmount)) {
    const message = await ctx.reply(ctx.t('invalid_amount_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  ctx.session.currentOperation = {
    ...currentOperation,
    toAmount: toAmount, // Target tokens to receive
  };

  await ctx.reply(ctx.t('limit_expiry_msg'), {
    parse_mode: 'Markdown',
    reply_markup: limitExpiryKeyboard,
  });
}

/**
 * Handle target price for sell orders (how much ETH to get)
 */
export async function handleLimitSellTargetPrice(
  ctx: BotContext,
  targetPrice: string
): Promise<void> {
  const { currentOperation } = ctx.session;

  if (!currentOperation || currentOperation.subType !== 'sell' || !currentOperation.fromAmount) {
    await ctx.reply(ctx.t('limit_restart_msg'));
    return;
  }

  const parsedPrice = parseFloat(targetPrice);
  if (!isValidAmount(parsedPrice)) {
    const message = await ctx.reply(ctx.t('limit_invalid_price_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // Calculate total ETH to receive
  const toAmount = currentOperation.fromAmount * parsedPrice;

  ctx.session.currentOperation = {
    ...currentOperation,
    toAmount: toAmount, // Total ETH to receive
    unitPrice: parsedPrice, // Price per token
  };

  await ctx.reply(ctx.t('limit_expiry_msg'), {
    parse_mode: 'Markdown',
    reply_markup: limitExpiryKeyboard,
  });
}

// ======================================================
// Expiry Handlers
// ======================================================

/**
 * Handle expiry time selection
 */
export async function handleLimitExpiry(ctx: BotContext, expiry: string): Promise<void> {
  const { currentOperation } = ctx.session;

  if (!currentOperation || !currentOperation.toAmount) {
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

  // Validate expiry format
  const validation = validateExpiryTime(expiryValue);
  if (!validation.isValid) {
    const message = await ctx.reply(ctx.t('limit_invalid_expiry_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  ctx.session.currentOperation = {
    ...currentOperation,
    expiry: validation.expiry!,
  };

  // Show confirmation
  await showLimitOrderConfirmation(ctx);
}

/**
 * Handle custom expiry input
 */
export async function handleCustomExpiry(ctx: BotContext, expiry: string): Promise<void> {
  const validation = validateExpiryTime(expiry);

  if (!validation.isValid) {
    const message = await ctx.reply(ctx.t('limit_invalid_expiry_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  const { currentOperation } = ctx.session;
  if (!currentOperation) {
    await ctx.reply(ctx.t('limit_restart_msg'));
    return;
  }

  ctx.session.currentOperation = {
    ...currentOperation,
    expiry: validation.expiry!,
  };

  await showLimitOrderConfirmation(ctx);
}

// ======================================================
// Confirmation & Execution
// ======================================================

/**
 * Show limit order confirmation
 */
async function showLimitOrderConfirmation(ctx: BotContext): Promise<void> {
  const { currentOperation } = ctx.session;

  if (!currentOperation || !currentOperation.expiry) {
    await ctx.reply(ctx.t('limit_restart_msg'));
    return;
  }

  const expiryDescription = getExpiryDescription(currentOperation.expiry);

  if (currentOperation.subType === 'buy') {
    const message = ctx.t('limit_buy_confirm_msg', {
      tokenSymbol: currentOperation.tokenSymbol || '',
      tokenName: currentOperation.tokenName || '',
      token: currentOperation.token || '',
      fromAmount: currentOperation.fromAmount?.toString() || '0',
      toAmount: currentOperation.toAmount?.toString() || '0',
      expiry: expiryDescription,
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: limitBuyConfirmKeyboard,
    });
  } else {
    const unitPrice =
      currentOperation.unitPrice || currentOperation.toAmount! / currentOperation.fromAmount!;
    const message = ctx.t('limit_sell_confirm_msg', {
      tokenSymbol: currentOperation.tokenSymbol || '',
      tokenName: currentOperation.tokenName || '',
      token: currentOperation.token || '',
      fromAmount: currentOperation.fromAmount?.toString() || '0',
      toAmount: currentOperation.toAmount?.toString() || '0',
      unitPrice: unitPrice.toString(),
      expiry: expiryDescription,
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: limitSellConfirmKeyboard,
    });
  }
}

/**
 * Confirm and execute buy limit order
 */
export async function confirmLimitBuyOrder(ctx: BotContext): Promise<void> {
  const user = await validateUser(ctx);
  const { currentOperation } = ctx.session;

  const privateKey = await PrivateStorageService.getPrivateKey(user.wallets[0].address);
  if (!privateKey || !(await validatePK(ctx, privateKey))) return;

  if (
    !currentOperation?.fromAmount ||
    !currentOperation?.toAmount ||
    !currentOperation?.token ||
    !currentOperation?.expiry ||
    currentOperation.subType !== 'buy'
  ) {
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  await executeLimitOrder(ctx, user, privateKey, currentOperation);
}

/**
 * Confirm and execute sell limit order
 */
export async function confirmLimitSellOrder(ctx: BotContext): Promise<void> {
  const user = await validateUser(ctx);
  const { currentOperation } = ctx.session;

  const privateKey = await PrivateStorageService.getPrivateKey(user.wallets[0].address);
  if (!privateKey || !(await validatePK(ctx, privateKey))) return;

  if (
    !currentOperation?.fromAmount ||
    !currentOperation?.toAmount ||
    !currentOperation?.token ||
    !currentOperation?.expiry ||
    currentOperation.subType !== 'sell'
  ) {
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  await executeLimitOrder(ctx, user, privateKey, currentOperation);
}

/**
 * Execute the limit order
 */
async function executeLimitOrder(
  ctx: BotContext,
  user: Awaited<ReturnType<typeof validateUser>>,
  privateKey: string,
  operation: OperationState
): Promise<void> {
  try {
    // Validate required fields
    if (!operation.token || !operation.fromAmount || !operation.toAmount || !operation.expiry) {
      const message = await ctx.reply(ctx.t('error_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    const params: LimitOrderParams = {
      fromTokenAddress:
        operation.subType === 'buy'
          ? '0x4200000000000000000000000000000000000006' // WETH on Base
          : operation.token,
      toTokenAddress:
        operation.subType === 'buy'
          ? operation.token
          : '0x4200000000000000000000000000000000000006', // WETH on Base
      fromAmount: operation.fromAmount,
      toAmount: operation.toAmount,
      expire: operation.expiry,
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
          tokenInAddress: params.fromTokenAddress,
          tokenInSymbol: operation.subType === 'buy' ? 'ETH' : operation.tokenSymbol || 'TOKEN',
          tokenInAmount: operation.fromAmount,
          tokenOutAddress: params.toTokenAddress,
          tokenOutSymbol: operation.subType === 'buy' ? operation.tokenSymbol || 'TOKEN' : 'ETH',
          tokenOutAmount: operation.toAmount,
          expire: operation.expiry,
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

    if (result.success) {
      // Update transaction with success status
      await TransactionsService.updateTransactionStatus(
        transaction.id,
        TransactionStatus.COMPLETED
      );

      const messageKey =
        operation.subType === 'buy'
          ? 'limit_buy_order_created_msg'
          : 'limit_sell_order_created_msg';
      const message = ctx.t(messageKey, {
        tokenSymbol: operation.tokenSymbol || '',
        fromAmount: operation.fromAmount.toString(),
        toAmount: operation.toAmount.toString(),
        expiry: getExpiryDescription(operation.expiry),
        unitPrice: operation.unitPrice?.toString() || '',
      });

      await ctx.reply(message, {
        parse_mode: 'Markdown',
      });
      ctx.session.currentOperation = null;
    } else {
      // Update transaction with failed status
      await TransactionsService.updateTransactionStatus(transaction.id, TransactionStatus.FAILED);

      const message = await ctx.reply(ctx.t('error_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
      ctx.session.currentOperation = null;
    }
  } catch (error) {
    logger.error('Error executing limit order:', error);
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    ctx.session.currentOperation = null;
  }
}

// ======================================================
// Cancellation Handlers
// ======================================================

/**
 * Cancel limit order creation
 */
export async function limitCancel(ctx: BotContext): Promise<void> {
  await validateUser(ctx);

  // Reset operation
  ctx.session.currentOperation = null;

  // Send cancel message
  const cancelMessage = await ctx.reply(ctx.t('limit_cancel_msg'));
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await ctx.api.deleteMessage(cancelMessage.chat.id, cancelMessage.message_id);

  // Send start message
  await ctx.reply(ctx.t('start_msg'), {
    parse_mode: 'Markdown',
    reply_markup: startKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

/**
 * Cancel existing limit order
 */
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
      orderData: orderToCancel.data as unknown as LimitOrderAssetData,
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

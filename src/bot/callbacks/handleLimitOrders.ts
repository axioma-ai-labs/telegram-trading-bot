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
import { validateUser } from '@/utils/userValidation';
import { validatePK } from '@/utils/validators';

import { limitConfirmKeyboard, limitExpiryKeyboard } from '../commands/limit';
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

  await ctx.reply(ctx.t('limit_price_msg'), {
    parse_mode: 'Markdown',
  });
}

export async function retrieveLimitPrice(ctx: BotContext, price: string): Promise<void> {
  const { currentOperation } = ctx.session;
  if (!currentOperation || currentOperation.type !== 'limit' || !currentOperation.amount) {
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
  const { currentOperation } = ctx.session;
  if (!currentOperation || currentOperation.type !== 'limit' || !currentOperation.price) {
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

  // Show confirmation message
  const message = ctx.t('limit_confirm_msg', {
    token: currentOperation.token || '',
    tokenSymbol: currentOperation.tokenSymbol || '',
    tokenName: currentOperation.tokenName || '',
    amount: amount,
    price: price,
    totalValue: totalValue,
    expiry: expiryValue,
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
    !currentOperation?.expiry
  ) {
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // Calculate the amount of WETH to receive based on price
  const toAmount = currentOperation.amount * currentOperation.price;

  const params: LimitOrderParams = {
    fromTokenAddress: currentOperation.token, // Token to sell
    toTokenAddress: '0x4200000000000000000000000000000000000006', // WETH on Base
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
        tokenOutAddress: '0x4200000000000000000000000000000000000006', // WETH on Base
        tokenOutSymbol: 'ETH',
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

  if (result.success) {
    // Update transaction with success status
    await TransactionsService.updateTransactionStatus(transaction.id, TransactionStatus.COMPLETED);

    const message = ctx.t('limit_order_created_msg', {
      tokenSymbol: currentOperation?.tokenSymbol || '',
      amount: currentOperation.amount,
      price: currentOperation.price,
      expiry: currentOperation.expiry,
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

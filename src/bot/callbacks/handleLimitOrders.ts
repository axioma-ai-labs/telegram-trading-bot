import { InlineKeyboard } from 'grammy';

import logger from '@/config/logger';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import { GasPriority } from '@/types/config';
import { LimitOrderParams } from '@/types/neurodex';
import { LimitOrderAssetData } from '@/types/openocean';
import { BotContext } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { validateUser } from '@/utils/userValidation';
import { validatePK } from '@/utils/validators';

// limit token callback
export async function limitToken(ctx: BotContext): Promise<void> {
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;

  ctx.session.currentOperation = { type: 'limit' };

  await ctx.reply(ctx.t('limit_token_msg'), {
    parse_mode: 'Markdown',
  });
}

// retrieve limit amount callback
export async function retrieveLimitAmount(ctx: BotContext, amount: string): Promise<void> {
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;
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
    reply_markup: new InlineKeyboard()
      .text('1 Hour', 'limit_expiry_1H')
      .text('1 Day', 'limit_expiry_1D')
      .text('1 Week', 'limit_expiry_7D')
      .row()
      .text('1 Month', 'limit_expiry_30D')
      .text('Custom', 'limit_expiry_custom'),
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
    reply_markup: new InlineKeyboard()
      .text('✅ Confirm', 'limit_confirm')
      .text('❌ Cancel', 'limit_cancel'),
  });
}

// confirm limit order
export async function confirmLimitOrder(ctx: BotContext): Promise<void> {
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.wallets?.[0]) return;
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

  const neurodex = new NeuroDexApi();
  const result = await neurodex.createLimitOrder(params, 'base');
  logger.info('LIMIT ORDER RESULT:', result);

  if (result.success) {
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
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    ctx.session.currentOperation = null;
  }
}

// cancel limit order
export async function limitCancel(ctx: BotContext): Promise<void> {
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;

  ctx.session.currentOperation = null;
  const message = await ctx.reply(ctx.t('limit_cancel_msg'));
  deleteBotMessage(ctx, message.message_id, 5000);
}

// cancel limit order
export async function cancelLimitOrder(ctx: BotContext, orderHash: string): Promise<void> {
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.wallets?.[0]) return;

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

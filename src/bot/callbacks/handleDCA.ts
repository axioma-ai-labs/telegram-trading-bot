import { confirmDcaKeyboard, intervalKeyboard, timesKeyboard } from '@/bot/commands/dca';
import logger from '@/config/logger';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import { GasPriority } from '@/types/config';
import { DcaParams } from '@/types/neurodex';
import { DcaOrderAssetData } from '@/types/openocean';
import { BotContext } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { formatInterval } from '@/utils/formatters';
import { validateUser } from '@/utils/userValidation';

export async function dcaToken(ctx: BotContext): Promise<void> {
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;

  // DCA
  ctx.session.currentOperation = {
    type: 'dca',
  };

  await ctx.reply(ctx.t('dca_token_msg'), {
    parse_mode: 'Markdown',
  });
}

export async function retrieveDcaAmount(ctx: BotContext, amount: string): Promise<void> {
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;

  const { currentOperation } = ctx.session;

  // custom amount
  if (amount === 'custom') {
    await ctx.reply(ctx.t('dca_custom_amount_msg'), {
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
    type: 'dca',
    amount: parsedAmount,
  };

  logger.info('🟧 OPERATION:', ctx.session.currentOperation);

  await ctx.reply(ctx.t('dca_interval_msg'), {
    reply_markup: intervalKeyboard,
    parse_mode: 'Markdown',
  });
}

export async function retrieveDcaInterval(ctx: BotContext, interval: string): Promise<void> {
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;

  const { currentOperation } = ctx.session;

  // custom interval
  if (interval === 'custom') {
    await ctx.reply(ctx.t('dca_custom_interval_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  }

  // interval
  const parsedInterval = parseInt(interval);

  ctx.session.currentOperation = {
    ...currentOperation,
    type: 'dca',
    interval: parsedInterval,
  };

  logger.info('🟧 OPERATION:', ctx.session.currentOperation);

  await ctx.reply(ctx.t('dca_times_msg'), {
    reply_markup: timesKeyboard,
    parse_mode: 'Markdown',
  });
}

export async function retrieveDcaTimes(ctx: BotContext, times: string): Promise<void> {
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;

  const { currentOperation } = ctx.session;

  if (times === 'custom') {
    await ctx.reply(ctx.t('dca_custom_times_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  }

  const parsedTimes = parseInt(times);

  if (isNaN(parsedTimes) || parsedTimes < 1 || parsedTimes > 100) {
    const message = await ctx.reply(ctx.t('dca_invalid_times_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  ctx.session.currentOperation = {
    ...currentOperation,
    type: 'dca',
    times: parsedTimes,
  };

  const message = ctx.t('dca_confirm_msg', {
    token: currentOperation?.token || '',
    tokenSymbol: currentOperation?.tokenSymbol || '',
    tokenName: currentOperation?.tokenName || '',
    amount: (currentOperation?.amount || 0).toString(),
    interval: formatInterval(currentOperation?.interval || 0),
    times: parsedTimes.toString(),
  });

  await ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: confirmDcaKeyboard,
  });

  logger.info('🟧 OPERATION:', ctx.session.currentOperation);
}

export async function dcaConfirm(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.wallets?.[0]) return;

  const settings = user?.settings;
  const { currentOperation } = ctx.session;

  if (
    !currentOperation ||
    !currentOperation.token ||
    !currentOperation.amount ||
    !currentOperation.interval ||
    !currentOperation.times
  ) {
    const message = await ctx.reply(ctx.t('invalid_token_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  const privateKey = await PrivateStorageService.getPrivateKey(user.wallets[0].address);
  if (!privateKey) {
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  try {
    const neurodex = new NeuroDexApi();
    const wallet = user.wallets[0];

    const dcaParams: DcaParams = {
      toTokenAddress: currentOperation.token, // token to buy
      fromAmount: currentOperation.amount, // amount of native token to spend
      time: currentOperation.interval,
      times: currentOperation.times,
      expire: '1D', // Default expiration of 1 day
      slippage: Number(settings?.slippage),
      gasPriority: 'standard',
      walletAddress: wallet.address,
      privateKey: privateKey,
      referrer: '0x8159F8156cD0F89114f72cD915b7b4BD7e83Ad4D',
    };

    // create dca order
    const dcaOrderResult = await neurodex.createDcaOrder(dcaParams, 'base');

    // success
    if (dcaOrderResult.success && dcaOrderResult.data) {
      // reset
      ctx.session.currentOperation = null;

      const message = ctx.t('dca_success_msg', {
        token: currentOperation?.token || '',
        tokenSymbol: currentOperation?.tokenSymbol || '',
        tokenName: currentOperation?.tokenName || '',
        amount: (currentOperation?.amount || 0).toString(),
        interval: formatInterval(currentOperation?.interval || 0),
        times: (currentOperation?.times || 0).toString(),
      });

      await ctx.reply(message, {
        parse_mode: 'Markdown',
      });
    } else {
      // check if no mooooooooney
      const message = dcaOrderResult.error?.toLowerCase() || '';
      if (message.includes('insufficient funds')) {
        const message = await ctx.reply(ctx.t('insufficient_funds_msg'));
        deleteBotMessage(ctx, message.message_id, 10000);
      } else {
        const message = await ctx.reply(ctx.t('error_msg'));
        deleteBotMessage(ctx, message.message_id, 10000);
      }
    }
  } catch (error) {
    logger.error('Error creating DCA order:', error);
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
  }
}

export async function dcaCancel(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;

  // reset operation
  ctx.session.currentOperation = null;
  const message = await ctx.reply(ctx.t('dca_cancel_msg'));
  deleteBotMessage(ctx, message.message_id, 5000);
}

export async function cancelDcaOrder(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.wallets?.[0]) return;

  try {
    const neurodex = new NeuroDexApi();
    const wallet = user.wallets[0];

    // active DCA orders
    const dcaOrders = await neurodex.getDcaOrders(
      {
        address: wallet.address,
        statuses: [1, 5],
      },
      'base'
    );

    if (!dcaOrders.success || !dcaOrders.data || dcaOrders.data.length === 0) {
      const message = await ctx.reply(ctx.t('dca_no_orders_msg'));
      deleteBotMessage(ctx, message.message_id, 5000);
      return;
    }

    // first active order
    const orderToCancel = dcaOrders.data[0];

    // DCA order data
    const orderData: DcaOrderAssetData = {
      makerAsset: orderToCancel.data.makerAsset,
      makerAssetSymbol: orderToCancel.data.makerAssetSymbol,
      makerAssetDecimals: 18,
      makerAssetIcon: '',
      takerAsset: orderToCancel.data.takerAsset,
      takerAssetSymbol: orderToCancel.data.takerAssetSymbol,
      takerAssetDecimals: 18,
      takerAssetIcon: '',
      getMakerAmount: '',
      getTakerAmount: '',
      makerAssetData: '',
      takerAssetData: '',
      salt: '',
      permit: '',
      predicate: '',
      interaction: '',
      makingAmount: orderToCancel.data.makingAmount,
      takingAmount: orderToCancel.data.takingAmount,
      maker: orderToCancel.data.maker,
      receiver: '',
      allowedSender: '',
    };

    const privateKey = await PrivateStorageService.getPrivateKey(user.wallets[0].address);
    if (!privateKey) {
      const message = await ctx.reply(ctx.t('error_msg'));
      deleteBotMessage(ctx, message.message_id, 5000);
      return;
    }

    // cancel DCA order
    const cancelResult = await neurodex.cancelDcaOrder(
      {
        orderHash: orderToCancel.orderHash,
        orderData,
        slippage: Number(user.settings?.slippage),
        gasPriority: user.settings?.gasPriority as GasPriority,
        walletAddress: wallet.address,
        privateKey: privateKey,
        referrer: '0x8159F8156cD0F89114f72cD915b7b4BD7e83Ad4D',
      },
      'base'
    );

    if (cancelResult.success) {
      const message = await ctx.reply(ctx.t('dca_cancel_msg'));
      deleteBotMessage(ctx, message.message_id, 5000);
    } else {
      throw new Error(cancelResult.error || 'Failed to cancel DCA order');
    }
  } catch (error) {
    logger.error('Error cancelling DCA order:', error);
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
  }
}

export async function getDcaOrders(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.wallets?.[0]) return;

  // get DCA orders
  const neurodex = new NeuroDexApi();
  const dcaOrders = await neurodex.getDcaOrders(
    {
      address: user.wallets[0].address,
      statuses: [1, 5],
    },
    'base'
  );

  if (!dcaOrders.success || !dcaOrders.data || dcaOrders.data.length === 0) {
    const message = await ctx.reply(ctx.t('dca_no_orders_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  // send DCA orders
  const message = await ctx.reply(ctx.t('dca_orders_found_msg'));
  deleteBotMessage(ctx, message.message_id, 5000);
}

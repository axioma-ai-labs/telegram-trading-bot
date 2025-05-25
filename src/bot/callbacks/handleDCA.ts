import { BotContext } from '@/types/telegram';
import { GasPriority } from '@/types/config';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { formatInterval } from '@/utils/formatters';
import { DcaOrderAssetData } from '@/types/openocean';
import { validateUserAndWallet } from '@/utils/userValidation';
import {
  dcaTokenMessage,
  custom_amount_message,
  invalid_amount_message,
  invalid_times_message,
  intervalMessage,
  intervalKeyboard,
  timesMessage,
  timesKeyboard,
  custom_interval_message,
  custom_times_message,
  confirmDcaKeyboard,
  confirmDcaMessage,
  error_dca_message,
  error_message,
  insufficient_funds_message,
} from '@/bot/commands/dca';
import { DcaParams } from '@/types/neurodex';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import logger from '@/config/logger';

const dca_success_message = (
  amount: number,
  token: string,
  tokenSymbol: string,
  tokenName: string,
  interval: string,
  times: number
): string =>
  `✅ DCA order created successfully!\n\n` +
  `Check your DCA orders details:\n` +
  `• Amount: ${amount} ETH\n` +
  `• Token: ${tokenSymbol} | ${tokenName}\n` +
  `• CA: ${token}\n` +
  `• Interval: ${interval}\n` +
  `• Times: ${times}\n` +
  `You can view your open DCA orders using /orders`;

export async function dcaToken(ctx: BotContext): Promise<void> {
  const { isValid } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  // DCA
  ctx.session.currentOperation = {
    type: 'dca',
  };

  await ctx.reply(dcaTokenMessage, {
    parse_mode: 'Markdown',
  });
}

export async function retrieveDcaAmount(ctx: BotContext, amount: string): Promise<void> {
  const { isValid } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  const { currentOperation } = ctx.session;

  // custom amount
  if (amount === 'custom') {
    await ctx.reply(custom_amount_message, {
      parse_mode: 'Markdown',
    });
    return;
  }

  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    const message = await ctx.reply(invalid_amount_message);
    await deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  ctx.session.currentOperation = {
    ...currentOperation,
    type: 'dca',
    amount: parsedAmount,
  };

  logger.info('🟧 OPERATION:', ctx.session.currentOperation);

  await ctx.reply(intervalMessage, {
    reply_markup: intervalKeyboard,
    parse_mode: 'Markdown',
  });
}

export async function retrieveDcaInterval(ctx: BotContext, interval: string): Promise<void> {
  const { isValid } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  const { currentOperation } = ctx.session;

  // custom interval
  if (interval === 'custom') {
    await ctx.reply(custom_interval_message, {
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

  await ctx.reply(timesMessage, {
    reply_markup: timesKeyboard,
    parse_mode: 'Markdown',
  });
}

export async function retrieveDcaTimes(ctx: BotContext, times: string): Promise<void> {
  const { isValid } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  const { currentOperation } = ctx.session;

  if (times === 'custom') {
    await ctx.reply(custom_times_message, {
      parse_mode: 'Markdown',
    });
    return;
  }

  const parsedTimes = parseInt(times);

  if (isNaN(parsedTimes) || parsedTimes < 1 || parsedTimes > 100) {
    const message = await ctx.reply(invalid_times_message);
    await deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  ctx.session.currentOperation = {
    ...currentOperation,
    type: 'dca',
    times: parsedTimes,
  };

  const message = confirmDcaMessage(
    currentOperation?.token || '',
    currentOperation?.tokenSymbol || '',
    currentOperation?.tokenName || '',
    currentOperation?.amount || 0,
    currentOperation?.interval || 0,
    parsedTimes
  );

  await ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: confirmDcaKeyboard,
  });

  logger.info('🟧 OPERATION:', ctx.session.currentOperation);
}

export async function dcaConfirm(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
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
    const message = await ctx.reply('❌ Invalid DCA operation. Please try again.');
    await deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  const privateKey = await PrivateStorageService.getPrivateKey(user.wallets[0].address);
  if (!privateKey) {
    const message = await ctx.reply('❌ Private key not found. Please try again.');
    await deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  try {
    const neurodex = new NeuroDexApi();
    const wallet = user.wallets[0];

    const dcaParams: DcaParams = {
      makerTokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // token to spend
      makerTokenDecimals: 18,
      takerTokenAddress: currentOperation.token, // token to buy
      takerTokenDecimals: 18,
      makerAmount: (currentOperation.amount * 1e18).toString(),
      time: currentOperation.interval,
      times: currentOperation.times,
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

      const successMessage = dca_success_message(
        currentOperation.amount,
        currentOperation.token,
        currentOperation.tokenSymbol || '',
        currentOperation.tokenName || '',
        formatInterval(currentOperation.interval),
        currentOperation.times
      );

      await ctx.reply(successMessage, {
        parse_mode: 'Markdown',
      });
    } else {
      // check if no mooooooooney
      const message = dcaOrderResult.error?.toLowerCase() || '';
      if (message.includes('insufficient funds')) {
        const message = await ctx.reply(insufficient_funds_message);
        await deleteBotMessage(ctx, message.message_id, 10000);
      } else {
        const message = await ctx.reply(error_message);
        await deleteBotMessage(ctx, message.message_id, 10000);
      }
    }
  } catch (error) {
    logger.error('Error creating DCA order:', error);
    const message = await ctx.reply(error_dca_message);
    await deleteBotMessage(ctx, message.message_id, 5000);
  }
}

export async function dcaCancel(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  // reset operation
  ctx.session.currentOperation = null;
  const message = await ctx.reply('✅ DCA order has been successfully cancelled!');
  await deleteBotMessage(ctx, message.message_id, 5000);
}

export async function cancelDcaOrder(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
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
      const message = await ctx.reply('❌ No active DCA orders found to cancel.');
      await deleteBotMessage(ctx, message.message_id, 5000);
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
      const message = await ctx.reply('❌ Private key not found. Please try again.');
      await deleteBotMessage(ctx, message.message_id, 5000);
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
      const message = await ctx.reply('✅ DCA order has been successfully cancelled!');
      await deleteBotMessage(ctx, message.message_id, 5000);
    } else {
      throw new Error(cancelResult.error || 'Failed to cancel DCA order');
    }
  } catch (error) {
    logger.error('Error cancelling DCA order:', error);
    const message = await ctx.reply('❌ Failed to cancel DCA order. Please try again later.');
    await deleteBotMessage(ctx, message.message_id, 5000);
  }
}

export async function getDcaOrders(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
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
    const message = await ctx.reply('❌ No active DCA orders found.');
    await deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  // send DCA orders
  const message = await ctx.reply('✅ DCA orders found.');
  await deleteBotMessage(ctx, message.message_id, 5000);
}

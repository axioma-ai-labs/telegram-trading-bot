import { InlineKeyboard } from 'grammy';

import { limitOrdersListMessage } from '@/bot/commands/limit';
import logger from '@/config/logger';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { GasPriority } from '@/types/config';
import { LimitOrderAssetData } from '@/types/openocean';
import { BotContext } from '@/types/telegram';
import { getValidatedUser, validateUserAndWallet } from '@/utils/userValidation';

export async function limitToken(ctx: BotContext): Promise<void> {
  try {
    const { isValid } = await validateUserAndWallet(ctx);
    if (!isValid) return;

    ctx.session.currentOperation = { type: 'limit' };

    await ctx.reply(ctx.t('limit_token_msg'), {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    logger.error('Error in limitToken:', error);
    await ctx.reply(ctx.t('limit_error_msg'));
  }
}

export async function retrieveLimitAmount(ctx: BotContext, amount: string): Promise<void> {
  try {
    const { currentOperation } = ctx.session;
    if (!currentOperation || currentOperation.type !== 'limit' || !currentOperation.token) {
      await ctx.reply(ctx.t('invalid_token_msg'));
      return;
    }

    let parsedAmount: number;
    if (amount === 'custom') {
      await ctx.reply(ctx.t('limit_custom_amount_msg'));
      return;
    } else {
      parsedAmount = parseFloat(amount);
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      await ctx.reply(ctx.t('invalid_amount_msg'));
      return;
    }

    ctx.session.currentOperation = {
      ...currentOperation,
      amount: parsedAmount,
    };

    await ctx.reply(ctx.t('limit_price_msg'), {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    logger.error('Error in retrieveLimitAmount:', error);
    await ctx.reply(ctx.t('limit_error_msg'));
  }
}

export async function retrieveLimitPrice(ctx: BotContext, price: string): Promise<void> {
  try {
    const { currentOperation } = ctx.session;
    if (!currentOperation || currentOperation.type !== 'limit' || !currentOperation.amount) {
      await ctx.reply(ctx.t('limit_restart_msg'));
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      await ctx.reply(ctx.t('invalid_amount_msg'));
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
  } catch (error) {
    logger.error('Error in retrieveLimitPrice:', error);
    await ctx.reply(ctx.t('limit_error_msg'));
  }
}

export async function retrieveLimitExpiry(ctx: BotContext, expiry: string): Promise<void> {
  try {
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

    // Show confirmation message
    const message = ctx.t('limit_confirm_msg', {
      token: currentOperation.token || '',
      tokenSymbol: currentOperation.tokenSymbol || '',
      tokenName: currentOperation.tokenName || '',
      amount: currentOperation.amount || 0,
      price: currentOperation.price || 0,
      expiry: expiryValue,
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard()
        .text('✅ Confirm', 'limit_confirm')
        .text('❌ Cancel', 'limit_cancel'),
    });
  } catch (error) {
    logger.error('Error in retrieveLimitExpiry:', error);
    await ctx.reply(ctx.t('limit_error_msg'));
  }
}

export async function limitConfirm(ctx: BotContext): Promise<void> {
  try {
    const { currentOperation } = ctx.session;
    if (!currentOperation || currentOperation.type !== 'limit') {
      await ctx.reply(ctx.t('limit_no_order_msg'));
      return;
    }

    const user = await getValidatedUser(ctx);
    if (!user || !user.wallets.length) return;

    const wallet = user.wallets[0];
    const neurodex = new NeuroDexApi();

    // get private key
    const privateKey = await neurodex.getPrivateKey(wallet.address);
    if (!privateKey) {
      await ctx.reply(ctx.t('error_msg'));
      return;
    }

    // get token data to determine decimals
    const tokenData = await neurodex.getTokenDataByContractAddress(currentOperation.token!, 'base');
    if (!tokenData.success || !tokenData.data) {
      await ctx.reply(ctx.t('error_msg'));
      return;
    }

    // calculate amounts with proper decimals
    const makerTokenDecimals = tokenData.data.decimals || 18;
    const takerTokenDecimals = 18; // WETH decimals
    const makerAmount = (currentOperation.amount! * Math.pow(10, makerTokenDecimals)).toString();
    const takerAmount = (
      currentOperation.amount! *
      currentOperation.price! *
      Math.pow(10, takerTokenDecimals)
    ).toString();

    logger.info('Wallet address:', wallet.address);
    logger.info('Private key:', privateKey);
    logger.info('Maker token address:', currentOperation.token);
    logger.info('Maker token decimals:', makerTokenDecimals);
    logger.info('Taker token address:', '0x4200000000000000000000000000000000000006');
    logger.info('Taker token decimals:', takerTokenDecimals);
    logger.info('Maker amount:', makerAmount);

    // create limit order
    const result = await neurodex.createLimitOrder(
      {
        makerTokenAddress: currentOperation.token!,
        makerTokenDecimals: makerTokenDecimals,
        takerTokenAddress: '0x4200000000000000000000000000000000000006', // WETH on Base
        takerTokenDecimals: takerTokenDecimals,
        makerAmount: makerAmount,
        takerAmount: takerAmount,
        expire: currentOperation.expiry!,
        slippage: user.settings?.slippage ? parseFloat(user.settings.slippage) : 1,
        gasPriority: user.settings?.gasPriority as GasPriority,
        walletAddress: wallet.address,
        privateKey: privateKey,
        referrer: '0x8159F8156cD0F89114f72cD915b7b4BD7e83Ad4D',
      },
      'base'
    );

    if (result.success) {
      const message = ctx.t('limit_order_created_msg', {
        token: currentOperation.token || '',
        tokenSymbol: currentOperation.tokenSymbol || '',
        amount: currentOperation.amount!,
        price: currentOperation.price!,
        expiry: currentOperation.expiry!,
      });

      await ctx.reply(message, {
        parse_mode: 'Markdown',
      });
    }

    // Clear current operation
    ctx.session.currentOperation = null;
  } catch (error) {
    logger.error('Error in limitConfirm:', error);
    await ctx.reply(ctx.t('limit_error_msg'));
  }
}

export async function limitCancel(ctx: BotContext): Promise<void> {
  try {
    ctx.session.currentOperation = null;
    await ctx.reply(ctx.t('limit_cancel_msg'));
  } catch (error) {
    logger.error('Error in limitCancel:', error);
    await ctx.reply(ctx.t('limit_error_msg'));
  }
}

export async function getLimitOrders(ctx: BotContext): Promise<void> {
  try {
    const { isValid } = await validateUserAndWallet(ctx);
    if (!isValid) return;

    const user = await getValidatedUser(ctx);
    if (!user || !user.wallets.length) {
      await ctx.reply(ctx.t('no_wallet_msg'));
      return;
    }

    const wallet = user.wallets[0];
    const neurodex = new NeuroDexApi();

    const result = await neurodex.getLimitOrders(
      {
        address: wallet.address,
        statuses: [1, 2, 3, 4, 5, 6, 7], // All statuses
      },
      'base'
    );

    if (result.success && result.data) {
      if (result.data.length === 0) {
        await ctx.reply(ctx.t('limit_no_orders_msg'), {
          parse_mode: 'Markdown',
        });
        return;
      }

      const message = limitOrdersListMessage(result.data);

      const keyboard = new InlineKeyboard();
      const activeOrders = result.data.filter(
        (order) => order.status === 'unfilled' || order.status === 'pending'
      );

      activeOrders.forEach((order, index) => {
        if (index % 2 === 0) {
          keyboard.row();
        }
        keyboard.text(`Cancel #${index + 1}`, `cancel_limit_${order.orderHash}`);
      });

      if (activeOrders.length > 0) {
        keyboard.row().text('🔄 Refresh', 'refresh_limit_orders');
      }

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    }
  } catch (error) {
    logger.error('Error in getLimitOrders:', error);
    await ctx.reply(ctx.t('limit_error_msg'));
  }
}

export async function cancelLimitOrder(ctx: BotContext, orderHash: string): Promise<void> {
  try {
    const user = await getValidatedUser(ctx);
    if (!user || !user.wallets.length) {
      await ctx.reply(ctx.t('no_wallet_msg'));
      return;
    }

    const wallet = user.wallets[0];
    const neurodex = new NeuroDexApi();

    // Get private key
    const privateKey = await neurodex.getPrivateKey(wallet.address);
    if (!privateKey) {
      await ctx.reply(ctx.t('no_private_key_msg'));
      return;
    }

    // First get the order details
    const ordersResult = await neurodex.getLimitOrders(
      {
        address: wallet.address,
        statuses: [1, 3, 5], // Active orders
      },
      'base'
    );

    if (!ordersResult.success || !ordersResult.data) {
      await ctx.reply(ctx.t('error_msg'));
      return;
    }

    const orderToCancel = ordersResult.data.find((order) => order.orderHash === orderHash);
    if (!orderToCancel) {
      await ctx.reply(ctx.t('error_msg'));
      return;
    }

    // Cancel the order - the API cancellation only needs the orderHash
    // For onchain cancellation (fallback), we'll create a minimal orderData structure
    const result = await neurodex.cancelLimitOrder(
      {
        orderHash: orderHash,
        orderData: {} as unknown as LimitOrderAssetData, // Empty object since API cancellation doesn't use it
        slippage: user.settings?.slippage ? parseFloat(user.settings.slippage) : 1,
        gasPriority: (user.settings?.gasPriority as GasPriority) || 'standard',
        walletAddress: wallet.address,
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
    }
  } catch (error) {
    logger.error('Error in cancelLimitOrder:', error);
    await ctx.reply(ctx.t('limit_error_msg'));
  }
}

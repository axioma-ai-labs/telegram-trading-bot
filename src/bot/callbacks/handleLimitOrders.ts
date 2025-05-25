import { BotContext } from '@/types/telegram';
import { InlineKeyboard } from 'grammy';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { validateUserAndWallet, getValidatedUser } from '@/utils/userValidation';
import logger from '@/config/logger';
import {
  error_limit_message,
  invalid_amount_message,
  invalid_token_message,
  limitOrderCreatedMessage,
  limitOrdersListMessage,
  confirmLimitMessage,
  limitOrderCancelledMessage,
  noLimitOrdersMessage,
  limitPriceMessage,
  limitExpiryMessage,
  invalidPriceMessage,
  limitTokenMessage,
  limitCustomAmountMessage,
} from '@/bot/commands/limit';
import { GasPriority } from '@/types/config';
import { LimitOrderAssetData } from '@/types/openocean';

export async function limitToken(ctx: BotContext): Promise<void> {
  try {
    const { isValid } = await validateUserAndWallet(ctx);
    if (!isValid) return;

    ctx.session.currentOperation = { type: 'limit' };

    await ctx.reply(limitTokenMessage, {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    logger.error('Error in limitToken:', error);
    await ctx.reply(error_limit_message);
  }
}

export async function retrieveLimitAmount(ctx: BotContext, amount: string): Promise<void> {
  try {
    const { currentOperation } = ctx.session;
    if (!currentOperation || currentOperation.type !== 'limit' || !currentOperation.token) {
      await ctx.reply(invalid_token_message);
      return;
    }

    let parsedAmount: number;
    if (amount === 'custom') {
      await ctx.reply(limitCustomAmountMessage);
      return;
    } else {
      parsedAmount = parseFloat(amount);
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      await ctx.reply(invalid_amount_message);
      return;
    }

    ctx.session.currentOperation = {
      ...currentOperation,
      amount: parsedAmount,
    };

    await ctx.reply(limitPriceMessage, {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    logger.error('Error in retrieveLimitAmount:', error);
    await ctx.reply(error_limit_message);
  }
}

export async function retrieveLimitPrice(ctx: BotContext, price: string): Promise<void> {
  try {
    const { currentOperation } = ctx.session;
    if (!currentOperation || currentOperation.type !== 'limit' || !currentOperation.amount) {
      await ctx.reply('Please start over with /limit command.');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      await ctx.reply(invalidPriceMessage);
      return;
    }

    ctx.session.currentOperation = {
      ...currentOperation,
      price: parsedPrice,
    };

    await ctx.reply(limitExpiryMessage, {
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
    await ctx.reply(error_limit_message);
  }
}

export async function retrieveLimitExpiry(ctx: BotContext, expiry: string): Promise<void> {
  try {
    const { currentOperation } = ctx.session;
    if (!currentOperation || currentOperation.type !== 'limit' || !currentOperation.price) {
      await ctx.reply('Please start over with /limit command.');
      return;
    }

    let expiryValue: string;
    if (expiry === 'custom') {
      await ctx.reply('Please enter the expiry time (e.g., 2H, 3D, 1W):');
      return;
    } else {
      expiryValue = expiry;
    }

    ctx.session.currentOperation = {
      ...currentOperation,
      expiry: expiryValue,
    };

    // Show confirmation message
    const message = confirmLimitMessage(
      currentOperation.token || '',
      currentOperation.tokenSymbol || '',
      currentOperation.tokenName || '',
      currentOperation.amount || 0,
      currentOperation.price || 0,
      expiryValue
    );

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard()
        .text('✅ Confirm', 'limit_confirm')
        .text('❌ Cancel', 'limit_cancel'),
    });
  } catch (error) {
    logger.error('Error in retrieveLimitExpiry:', error);
    await ctx.reply(error_limit_message);
  }
}

export async function limitConfirm(ctx: BotContext): Promise<void> {
  try {
    const { currentOperation } = ctx.session;
    if (!currentOperation || currentOperation.type !== 'limit') {
      await ctx.reply('No limit order to confirm.');
      return;
    }

    const user = await getValidatedUser(ctx);
    if (!user || !user.wallets.length) return;

    const wallet = user.wallets[0];
    const neurodex = new NeuroDexApi();

    // get private key
    const privateKey = await neurodex.getPrivateKey(wallet.address);
    if (!privateKey) {
      await ctx.reply('❌ Failed to retrieve wallet private key.');
      return;
    }

    // get token data to determine decimals
    const tokenData = await neurodex.getTokenDataByContractAddress(currentOperation.token!, 'base');
    if (!tokenData.success || !tokenData.data) {
      await ctx.reply('❌ Failed to get token information.');
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

    console.log('Wallet address:', wallet.address);
    console.log('Private key:', privateKey);
    console.log('Maker token address:', currentOperation.token);
    console.log('Maker token decimals:', makerTokenDecimals);
    console.log('Taker token address:', '0x4200000000000000000000000000000000000006');
    console.log('Taker token decimals:', takerTokenDecimals);
    console.log('Maker amount:', makerAmount);

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
      await ctx.reply(
        limitOrderCreatedMessage(
          currentOperation.tokenSymbol || '',
          currentOperation.amount!,
          currentOperation.price!,
          currentOperation.expiry!
        ),
        {
          parse_mode: 'Markdown',
        }
      );
    } else {
      await ctx.reply(`❌ Failed to create limit order: ${result.error}`);
    }

    // Clear current operation
    ctx.session.currentOperation = null;
  } catch (error) {
    logger.error('Error in limitConfirm:', error);
    await ctx.reply(error_limit_message);
  }
}

export async function limitCancel(ctx: BotContext): Promise<void> {
  try {
    ctx.session.currentOperation = null;
    await ctx.reply('❌ Limit order creation cancelled.');
  } catch (error) {
    logger.error('Error in limitCancel:', error);
    await ctx.reply(error_limit_message);
  }
}

export async function getLimitOrders(ctx: BotContext): Promise<void> {
  try {
    const { isValid } = await validateUserAndWallet(ctx);
    if (!isValid) return;

    const user = await getValidatedUser(ctx);
    if (!user || !user.wallets.length) {
      await ctx.reply('❌ No wallet found. Please create a wallet first.');
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
        await ctx.reply(noLimitOrdersMessage, {
          parse_mode: 'Markdown',
        });
        return;
      }

      const message = limitOrdersListMessage(result.data);

      // Create keyboard with cancel buttons for active orders
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
    } else {
      await ctx.reply(`❌ Failed to retrieve limit orders: ${result.error}`);
    }
  } catch (error) {
    logger.error('Error in getLimitOrders:', error);
    await ctx.reply(error_limit_message);
  }
}

export async function cancelLimitOrder(ctx: BotContext, orderHash: string): Promise<void> {
  try {
    const user = await getValidatedUser(ctx);
    if (!user || !user.wallets.length) {
      await ctx.reply('❌ No wallet found. Please create a wallet first.');
      return;
    }

    const wallet = user.wallets[0];
    const neurodex = new NeuroDexApi();

    // Get private key
    const privateKey = await neurodex.getPrivateKey(wallet.address);
    if (!privateKey) {
      await ctx.reply('❌ Failed to retrieve wallet private key.');
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
      await ctx.reply('❌ Failed to retrieve order details.');
      return;
    }

    const orderToCancel = ordersResult.data.find((order) => order.orderHash === orderHash);
    if (!orderToCancel) {
      await ctx.reply('❌ Order not found or already cancelled.');
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
      await ctx.reply(
        limitOrderCancelledMessage(
          orderToCancel.data.makerAssetSymbol,
          orderToCancel.data.takerAssetSymbol
        ),
        {
          parse_mode: 'Markdown',
        }
      );
    } else {
      await ctx.reply(`❌ Failed to cancel limit order: ${result.error}`);
    }
  } catch (error) {
    logger.error('Error in cancelLimitOrder:', error);
    await ctx.reply(error_limit_message);
  }
}

import { InlineKeyboard } from 'grammy';

import logger from '@/config/logger';
import { CommandHandler } from '@/types/commands';
import { LimitOrderInfo, NeuroDexResponse, TokenData } from '@/types/neurodex';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

/**
 * Creates a limit token found message using i18n.
 *
 * @param ctx - Bot context with i18n support
 * @param tokenData - Token data from API response
 * @returns Formatted message string
 */
export const getLimitTokenFoundMessage = (
  ctx: BotContext,
  tokenData: NeuroDexResponse<TokenData>
): string => {
  return ctx.t('limit_token_found_msg', {
    tokenSymbol: tokenData.data?.symbol || '',
    tokenName: tokenData.data?.name || '',
    tokenPrice: tokenData.data?.price || '',
    tokenChain: tokenData.data?.chain || '',
  });
};

/**
 * Creates a limit order created message using i18n.
 *
 * @param ctx - Bot context with i18n support
 * @param tokenSymbol - Token symbol
 * @param amount - Amount of tokens
 * @param price - Price per token in ETH
 * @param expiry - Expiry time
 * @returns Formatted message string
 */
export const getLimitOrderCreatedMessage = (
  ctx: BotContext,
  tokenSymbol: string,
  amount: number,
  price: number,
  expiry: string
): string => {
  return ctx.t('limit_order_created_msg', {
    tokenSymbol,
    amount: amount.toString(),
    price: price.toString(),
    expiry,
  });
};

/**
 * Creates a limit order cancelled message using i18n.
 *
 * @param ctx - Bot context with i18n support
 * @param makerSymbol - Maker token symbol
 * @param takerSymbol - Taker token symbol
 * @returns Formatted message string
 */
export const getLimitOrderCancelledMessage = (
  ctx: BotContext,
  makerSymbol: string,
  takerSymbol: string
): string => {
  return ctx.t('limit_order_cancel_success_msg', {
    makerSymbol,
    takerSymbol,
  });
};

/**
 * Creates a limit order confirmation message using i18n.
 *
 * @param ctx - Bot context with i18n support
 * @param token - Token contract address
 * @param tokenSymbol - Token symbol
 * @param tokenName - Token name
 * @param amount - Amount of tokens
 * @param price - Price per token in ETH
 * @param expiry - Expiry time
 * @returns Formatted message string
 */
export const getLimitConfirmMessage = (
  ctx: BotContext,
  token: string,
  tokenSymbol: string,
  tokenName: string,
  amount: number,
  price: number,
  expiry: string
): string => {
  return ctx.t('limit_confirm_msg', {
    token,
    tokenSymbol,
    tokenName,
    amount: amount.toString(),
    price: price.toString(),
    totalValue: (amount * price).toFixed(6),
    expiry,
  });
};

export const limitOrdersListMessage = (orders: LimitOrderInfo[]): string => {
  let message = '📋 *Your Limit Orders*\n\n';

  orders.forEach((order, index) => {
    const statusEmoji =
      order.status === 'unfilled'
        ? '🟡'
        : order.status === 'filled'
          ? '✅'
          : order.status === 'cancelled'
            ? '❌'
            : order.status === 'expired'
              ? '⏰'
              : '🔄';

    const createdDate = new Date(order.data.createDateTime).toLocaleDateString();
    const expiryDate = new Date(order.data.expiry).toLocaleDateString();

    message += `${statusEmoji} *Order #${index + 1}*\n`;
    message += `${order.data.makerAssetSymbol} → ${order.data.takerAssetSymbol}\n`;
    message += `Amount: ${parseFloat(order.data.makerAssetAmount) / Math.pow(10, 18)} ${order.data.makerAssetSymbol}\n`;
    message += `Status: ${order.status}\n`;
    message += `Created: ${createdDate}\n`;
    message += `Expires: ${expiryDate}\n`;
    message += `Hash: \`${order.orderHash.slice(0, 10)}...\`\n\n`;
  });

  return message;
};

export const limitAmountKeyboard = new InlineKeyboard()
  .text('1', 'limit_amount_1')
  .text('5', 'limit_amount_5')
  .text('10', 'limit_amount_10')
  .row()
  .text('25', 'limit_amount_25')
  .text('50', 'limit_amount_50')
  .row()
  .text('Custom', 'limit_amount_custom');

export const limitCommandHandler: CommandHandler = {
  command: 'limit',
  description: 'Create a limit order',
  handler: async (ctx: BotContext): Promise<void> => {
    try {
      // validate user
      const { isValid } = await validateUserAndWallet(ctx);
      if (!isValid) return;

      // set current operation
      ctx.session.currentOperation = { type: 'limit' };

      // Send token selection message
      await ctx.reply(ctx.t('limit_token_msg'), {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      logger.error('Error in limit command handler:', error);
      await ctx.reply(ctx.t('error_msg'), {
        parse_mode: 'Markdown',
      });
    }
  },
};

export const ordersCommandHandler: CommandHandler = {
  command: 'orders',
  description: 'View your limit orders',
  handler: async (ctx: BotContext): Promise<void> => {
    const { isValid } = await validateUserAndWallet(ctx);
    if (!isValid) return;
    // TODO: add retrieval of opened limit orders
    await ctx.reply(ctx.t('limit_loading_orders_msg'), {
      parse_mode: 'Markdown',
    });
  },
};

export const limitOrdersCommandHandler: CommandHandler = {
  command: 'limitorders',
  description: 'View your limit orders',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid } = await validateUserAndWallet(ctx);
    if (!isValid) return;

    logger.info('Limit orders command triggered by user:', ctx.from?.id);

    // This will be handled by importing getLimitOrders in bot.ts
    // For now, show a loading message
    await ctx.reply(ctx.t('limit_loading_orders_msg'), {
      parse_mode: 'Markdown',
    });
  },
};

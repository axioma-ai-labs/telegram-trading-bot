import { BotContext } from '@/types/telegram';
import { CommandHandler } from '@/types/commands';
import { NeuroDexResponse, TokenData, LimitOrderInfo } from '@/types/neurodex';
import { InlineKeyboard } from 'grammy';
import { validateUserAndWallet } from '@/utils/userValidation';
import logger from '@/config/logger';

export const limitTokenMessage =
  'Please send contract address of the token you want to create a limit order for:';
export const limitCustomAmountMessage = 'Please enter the amount of tokens you want to buy:';
export const error_message = '❌ Transaction failed. Please try again later.';
export const error_limit_message = '❌ Failed to create limit order. Please try again later.';
export const invalid_amount_message = '❌ Invalid amount selected. Please try again.';
export const insufficient_funds_message = '❌ Insufficient funds to complete the transaction.';
export const no_wallet_message = "❌ You don't have a wallet.\n\nPlease use /wallet to create one.";
export const not_registered_message = '❌ You are not registered.\n\nPlease use /start to begin.';
export const invalid_token_message = '❌ No token selected. Please select a token first.';
export const limitPriceMessage = 'Please enter the price per token (in ETH) for your limit order:';
export const limitExpiryMessage = 'Please select the expiry time for your limit order:';
export const invalidPriceMessage = '❌ Invalid price. Please enter a valid number greater than 0.';
export const invalidExpiryMessage = '❌ Invalid expiry format. Please use format like 1H, 2D, 1W.';
export const noLimitOrdersMessage =
  "📋 *No Limit Orders*\n\nYou don't have any limit orders yet.\n\nUse /limit to create your first limit order.";

export const limitTokenFoundMessage = (tokenData: NeuroDexResponse<TokenData>): string => `
✅ *Token Found*

Symbol: *$${tokenData.data?.symbol}*
Name: *${tokenData.data?.name}*
Price: $${tokenData.data?.price}
Chain: ${tokenData.data?.chain}

Please select how much ${tokenData.data?.symbol} you want to buy in your limit order.

Go to /settings to adjust slippage and gas if the transaction fails.
`;

export const limitOrderCreatedMessage = (
  tokenSymbol: string,
  amount: number,
  price: number,
  expiry: string
): string => `
✅ *Limit Order Created Successfully!*

*Token:* ${tokenSymbol}
*Amount:* ${amount} ${tokenSymbol}
*Price:* ${price} ETH per token
*Expiry:* ${expiry}

Your limit order has been submitted to the network. It will be executed when the market price reaches your target price.

Use /orders to view all your orders.
`;

export const limitOrderCancelledMessage = (makerSymbol: string, takerSymbol: string): string => `
✅ *Limit Order Cancelled*

Your limit order for ${makerSymbol} → ${takerSymbol} has been successfully cancelled.

Use /orders to view your remaining orders.
`;

export const confirmLimitMessage = (
  token: string,
  tokenSymbol: string,
  tokenName: string,
  amount: number,
  price: number,
  expiry: string
): string => `
🔍 *Confirm Limit Order*

*Token:* ${tokenSymbol} | ${tokenName}
*CA:* \`${token}\`
*Amount:* ${amount} ${tokenSymbol}
*Price:* ${price} ETH per token
*Total Value:* ${(amount * price).toFixed(6)} ETH
*Expiry:* ${expiry}

Please confirm to create the limit order:
`;

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
      await ctx.reply(limitTokenMessage, {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      logger.error('Error in limit command handler:', error);
      await ctx.reply(error_message, {
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
    await ctx.reply('📋 Loading your limit orders...', {
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
    await ctx.reply('📋 *Loading your limit orders...*', {
      parse_mode: 'Markdown',
    });
  },
};

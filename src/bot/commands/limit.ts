import { InlineKeyboard } from 'grammy';

import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUser } from '@/utils/userValidation';

// Initial choice keyboard for limit order type
export const limitTypeKeyboard = new InlineKeyboard()
  .text('🟢 Buy Token', 'limit_type_buy')
  .text('🔴 Sell Token', 'limit_type_sell')
  .row()
  .text('← Back', 'back_start');

// Amount selection keyboards
export const limitBuyAmountKeyboard = new InlineKeyboard()
  .text('0.1 ETH', 'limit_buy_amount_0.1')
  .text('0.5 ETH', 'limit_buy_amount_0.5')
  .text('1 ETH', 'limit_buy_amount_1')
  .row()
  .text('2 ETH', 'limit_buy_amount_2')
  .text('5 ETH', 'limit_buy_amount_5')
  .row()
  .text('Custom', 'limit_buy_amount_custom');

export const limitSellAmountKeyboard = new InlineKeyboard()
  .text('25%', 'limit_sell_amount_25')
  .text('50%', 'limit_sell_amount_50')
  .text('75%', 'limit_sell_amount_75')
  .row()
  .text('100%', 'limit_sell_amount_100')
  .row()
  .text('Custom', 'limit_sell_amount_custom');

// Price selection keyboard
export const limitPriceKeyboard = new InlineKeyboard()
  .text('Market -5%', 'limit_price_market_minus_5')
  .text('Market -10%', 'limit_price_market_minus_10')
  .row()
  .text('Market +5%', 'limit_price_market_plus_5')
  .text('Market +10%', 'limit_price_market_plus_10')
  .row()
  .text('Custom', 'limit_price_custom');

// Expiry selection keyboard
export const limitExpiryKeyboard = new InlineKeyboard()
  .text('1 Hour', 'limit_expiry_1H')
  .text('1 Day', 'limit_expiry_1D')
  .text('1 Week', 'limit_expiry_7D')
  .row()
  .text('1 Month', 'limit_expiry_30D')
  .text('Custom', 'limit_expiry_custom');

// Confirmation keyboards
export const limitBuyConfirmKeyboard = new InlineKeyboard()
  .text('✅ Confirm Buy Order', 'limit_buy_confirm')
  .text('❌ Cancel', 'limit_cancel');

export const limitSellConfirmKeyboard = new InlineKeyboard()
  .text('✅ Confirm Sell Order', 'limit_sell_confirm')
  .text('❌ Cancel', 'limit_cancel');

/**
 * Main limit order command handler
 * Initiates the limit order creation flow by asking user to choose between buy/sell
 */
export const limitCommandHandler: CommandHandler = {
  command: 'limit',
  description: 'Create a limit order',
  handler: async (ctx: BotContext): Promise<void> => {
    // Validate user
    await validateUser(ctx);

    // Reset operation state
    ctx.session.currentOperation = { type: 'limit' };

    // Send initial choice message
    await ctx.reply(ctx.t('limit_type_selection_msg'), {
      parse_mode: 'Markdown',
      reply_markup: limitTypeKeyboard,
    });
  },
};

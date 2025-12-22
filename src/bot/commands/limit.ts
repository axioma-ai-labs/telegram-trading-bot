import { InlineKeyboard } from 'grammy';

import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUser } from '@/utils/userValidation';

export const limitAmountKeyboard = new InlineKeyboard()
  .text('1', 'limit_amount_1')
  .text('5', 'limit_amount_5')
  .text('10', 'limit_amount_10')
  .row()
  .text('25', 'limit_amount_25')
  .text('50', 'limit_amount_50')
  .row()
  .text('Custom', 'limit_amount_custom');

// Common tokens on Base for quick selection
export const limitTargetTokenKeyboard = new InlineKeyboard()
  .text('ETH/WETH', 'limit_target_0x4200000000000000000000000000000000000006')
  .text('USDC', 'limit_target_0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913')
  .row()
  .text('USDT', 'limit_target_0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2')
  .text('DAI', 'limit_target_0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb')
  .row()
  .text('Custom Token', 'limit_target_custom');

export const limitConfirmKeyboard = new InlineKeyboard()
  .text('Confirm', 'limit_confirm')
  .text('Cancel', 'limit_cancel');

export const limitExpiryKeyboard = new InlineKeyboard()
  .text('1 Hour', 'limit_expiry_1H')
  .text('1 Day', 'limit_expiry_1D')
  .text('1 Week', 'limit_expiry_7D')
  .row()
  .text('1 Month', 'limit_expiry_30D')
  .text('Custom', 'limit_expiry_custom');

// limit command handler
export const limitCommandHandler: CommandHandler = {
  command: 'limit',
  description: 'Create a limit order',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    await validateUser(ctx);

    ctx.session.currentOperation = { type: 'limit' };

    // Send token selection message
    await ctx.reply(ctx.t('limit_token_msg'), {
      parse_mode: 'Markdown',
    });
  },
};

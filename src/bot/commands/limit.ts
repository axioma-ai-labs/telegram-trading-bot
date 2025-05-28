import { InlineKeyboard } from 'grammy';

import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

export const limitAmountKeyboard = new InlineKeyboard()
  .text('1', 'limit_amount_1')
  .text('5', 'limit_amount_5')
  .text('10', 'limit_amount_10')
  .row()
  .text('25', 'limit_amount_25')
  .text('50', 'limit_amount_50')
  .row()
  .text('Custom', 'limit_amount_custom');

// limit command handler
export const limitCommandHandler: CommandHandler = {
  command: 'limit',
  description: 'Create a limit order',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid } = await validateUserAndWallet(ctx);
    if (!isValid) return;

    ctx.session.currentOperation = { type: 'limit' };

    // Send token selection message
    await ctx.reply(ctx.t('limit_token_msg'), {
      parse_mode: 'Markdown',
    });
  },
};

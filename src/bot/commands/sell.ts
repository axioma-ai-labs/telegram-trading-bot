import { InlineKeyboard } from 'grammy';

import logger from '@/config/logger';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUser } from '@/utils/userValidation';

export const sellTokenKeyboard = new InlineKeyboard()
  .text('25%', 'sell_amount_25')
  .text('50%', 'sell_amount_50')
  .text('75%', 'sell_amount_75')
  .row()
  .text('100%', 'sell_amount_100')
  .row()
  .text('Custom', 'sell_amount_custom');

export const confirmSellKeyboard = new InlineKeyboard()
  .text('✅ Confirm', 'sell_confirm')
  .text('❌ Cancel', 'sell_cancel');

export const sellCommandHandler: CommandHandler = {
  command: 'sell',
  description: 'Sell a token',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid } = await validateUser(ctx);
    if (!isValid) return;

    ctx.session.currentOperation = { type: 'sell' };

    logger.info('Sell token message:', ctx.t('sell_token_msg'));

    await ctx.reply(ctx.t('sell_token_msg'), {
      parse_mode: 'Markdown',
    });
  },
};

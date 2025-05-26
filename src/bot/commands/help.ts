import { InlineKeyboard } from 'grammy';

import logger from '@/config/logger';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

export const helpKeyboard = new InlineKeyboard()
  .url('📞 Contact us', 'https://t.me/neurodex_support')
  .row()
  .text('← Back', 'back_start');

export const helpCommandHandler: CommandHandler = {
  command: 'help',
  description: 'Get help',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid } = await validateUserAndWallet(ctx);
    if (!isValid) return;

    const message = ctx.t('help_msg');
    logger.info('Help message:', message);

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: helpKeyboard,
    });
  },
};

import { helpKeyboard } from '@/bot/commands/help';
import { BotContext } from '@/types/telegram';
import { validateUser } from '@/utils/userValidation';

export async function handleGetHelp(ctx: BotContext): Promise<void> {
  // validate user
  await validateUser(ctx);

  const message = ctx.t('help_msg');

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: helpKeyboard,
  });
}

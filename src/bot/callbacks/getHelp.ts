import { helpKeyboard } from '@/bot/commands/help';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

export async function handleGetHelp(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  const message = ctx.t('help_msg');

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: helpKeyboard,
  });
}

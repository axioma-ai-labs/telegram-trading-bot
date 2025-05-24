import { BotContext } from '@/types/config';
import { helpKeyboard, helpMessage } from '@/bot/commands/help';
import { validateUserAndWallet } from '@/utils/userValidation';

export async function handleGetHelp(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  await ctx.editMessageText(helpMessage, {
    parse_mode: 'Markdown',
    reply_markup: helpKeyboard,
  });
}

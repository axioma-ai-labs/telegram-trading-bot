import { BotContext } from '@/types/config';
import { helpKeyboard, helpMessage } from '@/bot/commands/help';

export async function handleGetHelp(ctx: BotContext): Promise<void> {
  await ctx.editMessageText(helpMessage, {
    parse_mode: 'Markdown',
    reply_markup: helpKeyboard,
  });
}

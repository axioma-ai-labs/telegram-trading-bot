import { BotContext } from '@/types/config';
import { InlineKeyboard } from 'grammy';

export async function returnBack(
  ctx: BotContext,
  message: string,
  keyboard: InlineKeyboard
): Promise<void> {
  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

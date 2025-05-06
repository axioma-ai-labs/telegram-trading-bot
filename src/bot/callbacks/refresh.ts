import { BotContext } from '@/types/config';
import { depositMessage, depositKeyboard } from '@/bot/commands/deposit';
import { InlineKeyboard } from 'grammy';

export async function refresh(
  ctx: BotContext,
  message: string,
  keyboard: InlineKeyboard
): Promise<void> {
  // TODO: Get actual balance from database or blockchain and refresh
  const randomBalance = (Math.random() * 10000).toFixed(2);

  // Replace the old balance with the new one
  const updatedMessage = message.replace(/\$(\d+\.\d+)/, `$${randomBalance}`);

  await ctx.editMessageText(updatedMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

export async function refreshMessage(ctx: BotContext): Promise<void> {
  await refresh(ctx, depositMessage, depositKeyboard);
}

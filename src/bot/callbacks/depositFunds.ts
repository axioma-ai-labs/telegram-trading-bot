import { BotContext } from '@/types/config';
import { IS_NEW_USER, USER_HAS_WALLET } from '@/config/mock';
import { createWalletKeyboard } from '@/bot/commands/wallet';
import { depositMessage } from '@/bot/commands/deposit';
import { depositKeyboard } from '@/bot/commands/deposit';

export async function depositFunds(ctx: BotContext): Promise<void> {
  if (IS_NEW_USER || !USER_HAS_WALLET) {
    await ctx.editMessageText(
      "⚠️ You don't have a wallet yet.\n\nYou need to create a new wallet first:",
      {
        parse_mode: 'Markdown',
        reply_markup: createWalletKeyboard,
      }
    );
    return;
  }

  await ctx.editMessageText(depositMessage, {
    parse_mode: 'Markdown',
    reply_markup: depositKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

import { BotContext } from '@/types/config';
import { IS_NEW_USER, USER_HAS_WALLET } from '@/config/mock';
import { createWalletKeyboard } from '@/bot/commands/wallet';
import { withdrawMessage, withdrawKeyboard } from '@/bot/commands/withdraw';

export async function withdrawFunds(ctx: BotContext): Promise<void> {
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

  await ctx.editMessageText(withdrawMessage, {
    parse_mode: 'Markdown',
    reply_markup: withdrawKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

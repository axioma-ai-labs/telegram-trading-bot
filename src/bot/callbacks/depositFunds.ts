import { BotContext } from '@/types/config';
import { createWalletKeyboard } from '@/bot/commands/wallet';
import { depositMessage, depositKeyboard } from '@/bot/commands/deposit';
import { UserService } from '@/services/db/user.service';
import { NeuroDexApi } from '@/services/engine/neurodex';

export async function depositFunds(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id?.toString();
  if (!telegramId) return;

  const user = await UserService.getUserByTelegramId(telegramId);
  if (!user) return;

  // Check if user has a wallet
  if (!user.wallets || user.wallets.length === 0) {
    await ctx.editMessageText(
      "⚠️ You don't have a wallet yet.\n\nYou need to create a new wallet first:",
      {
        parse_mode: 'Markdown',
        reply_markup: createWalletKeyboard,
      }
    );
    return;
  }

  const neurodex = new NeuroDexApi();
  const balance = await neurodex.getEthBalance(telegramId);
  const ethBalance = balance.success && balance.data ? balance.data : '0.000';

  const message = depositMessage
    .replace('{ethBalance}', ethBalance)
    .replace('{walletAddress}', user.wallets[0].address);

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: depositKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

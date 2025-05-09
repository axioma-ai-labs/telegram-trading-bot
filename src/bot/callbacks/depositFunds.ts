import { BotContext } from '@/types/config';
import { IS_NEW_USER, USER_HAS_WALLET } from '@/config/mock';
import { createWalletKeyboard } from '@/bot/commands/wallet';
import { depositMessage } from '@/bot/commands/deposit';
import { depositKeyboard } from '@/bot/commands/deposit';
import { UserService } from '@/services/db/user.service';
import { WalletService } from '@/services/db/wallet.service';
import { NeuroDexApi } from '@/services/engine/neurodex';

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

  if (USER_HAS_WALLET) {
    const telegramId = ctx.from?.id.toString();
    const neurodex = new NeuroDexApi();
    if (!telegramId) return;

    const user = await UserService.getUserByTelegramId(telegramId);
    if (!user?.id) return;

    const wallets = await WalletService.getWalletsByUserId(user.id);
    const balance = await neurodex.getEthBalance(telegramId);

    const message = depositMessage
      .replace('{ethBalance}', balance.data || '0.000')
      .replace('{walletAddress}', wallets[0].address);

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: depositKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  }
}

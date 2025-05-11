import { BotContext } from '@/types/config';
import { UserService } from '@/services/db/user.service';
import { hasWallet } from '@/utils/checkUser';
import { startMessage, startKeyboard } from '@/bot/commands/start';
import { createWalletMessage, createWalletKeyboard } from '@/bot/commands/wallet';

export async function acceptTermsConditions(ctx: BotContext): Promise<void> {
  if (!ctx.from?.id) return;
  const telegramId = ctx.from.id.toString();

  const user = await UserService.getUserByTelegramId(telegramId);
  if (!user?.id) return;

  const USER_HAS_WALLET = await hasWallet(telegramId);
  await UserService.updateTermsAccepted(user.id, true);
  console.log('User accepted terms conditions:', telegramId);

  if (USER_HAS_WALLET) {
    // If user has wallet --> show start message
    await ctx.editMessageText(startMessage, {
      parse_mode: 'Markdown',
      reply_markup: startKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  } else {
    // If user doesn't have wallet --> show create wallet message
    await ctx.editMessageText(createWalletMessage, {
      parse_mode: 'Markdown',
      reply_markup: createWalletKeyboard,
    });
  }
}

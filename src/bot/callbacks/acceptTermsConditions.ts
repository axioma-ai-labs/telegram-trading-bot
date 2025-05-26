import { startKeyboard } from '@/bot/commands/start';
import { createWalletKeyboard } from '@/bot/commands/wallet';
import logger from '@/config/logger';
import { UserService } from '@/services/prisma/user';
import { BotContext } from '@/types/telegram';

export async function acceptTermsConditions(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id?.toString();
  if (!telegramId) return;

  const user = await UserService.getUserByTelegramId(telegramId);
  if (!user) return;

  // Update terms accepted status
  await UserService.updateTermsAccepted(user.id, true);
  logger.info('User accepted terms conditions:', telegramId);

  // Check if user has a wallet using included relation
  if (user.wallets && user.wallets.length > 0) {
    // If user has wallet --> show start message
    await ctx.editMessageText(ctx.t('start_msg'), {
      parse_mode: 'Markdown',
      reply_markup: startKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  } else {
    // If user doesn't have wallet --> show create wallet message
    await ctx.editMessageText(ctx.t('wallet_create_msg'), {
      parse_mode: 'Markdown',
      reply_markup: createWalletKeyboard,
    });
  }
}

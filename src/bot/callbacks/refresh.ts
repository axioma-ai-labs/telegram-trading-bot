import { BotContext } from '@/types/telegram';
import { depositMessage, depositKeyboard } from '@/bot/commands/deposit';
import { walletMessage, walletKeyboard } from '@/bot/commands/wallet';
import { UserService } from '@/services/prisma/user';
import { ViemService } from '@/services/engine/viem.service';
import logger from '@/config/logger';

export async function handleRefresh(ctx: BotContext): Promise<void> {
  const callbackData = ctx.callbackQuery?.data;
  const telegramId = ctx.from?.id?.toString();
  if (!callbackData || !telegramId) return;

  const user = await UserService.getUserByTelegramId(telegramId);
  if (!user?.wallets?.length) return;

  const walletAddress = user.wallets[0].address;
  const viemService = new ViemService();

  try {
    const balance = await viemService.getNativeBalance(walletAddress as `0x${string}`);
    const ethBalance = balance || '0.000';

    // Refresh deposit
    if (callbackData === 'refresh_deposit') {
      const message = depositMessage(walletAddress, ethBalance);

      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: depositKeyboard,
        link_preview_options: { is_disabled: true },
      });
    }
    // Refresh wallet
    else if (callbackData === 'refresh_wallet') {
      const message = walletMessage(walletAddress, ethBalance);

      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: walletKeyboard,
        link_preview_options: { is_disabled: true },
      });
    }
    // Refresh transactions (COMES SOOOOOOOOON BOIIII!!!)
    else if (callbackData === 'refresh_transactions') {
      // TODO: Implement transactions refresh
      return;
    }

    // Acknowledge the callback query to remove loading state
    await ctx.answerCallbackQuery();
  } catch (error: unknown) {
    // Handle case when message content hasn't changed
    if (error instanceof Error && error.message?.includes('message is not modified')) {
      await ctx.answerCallbackQuery({
        text: '✨ Already up to date!',
        show_alert: false,
      });
      return;
    }

    // Handle other errors
    logger.error('Error in handleRefresh:', error);
    await ctx.answerCallbackQuery({
      text: '❌ Failed to refresh. Please try again.',
      show_alert: true,
    });
  }
}

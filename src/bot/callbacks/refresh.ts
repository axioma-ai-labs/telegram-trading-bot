import { BotContext } from '@/types/config';
import { depositMessage, depositKeyboard } from '@/bot/commands/deposit';
import { walletMessage, walletKeyboard } from '@/bot/commands/wallet';
import { UserService } from '@/services/db/user.service';
import { WalletService } from '@/services/db/wallet.service';
import { NeuroDexApi } from '@/services/engine/neurodex';

export async function handleRefresh(ctx: BotContext): Promise<void> {
  const callbackData = ctx.callbackQuery?.data;
  const telegramId = ctx.from?.id.toString();
  if (!callbackData || !telegramId) return;

  const user = await UserService.getUserByTelegramId(telegramId);
  if (!user?.id) return;

  const wallets = await WalletService.getWalletsByUserId(user.id);
  if (!wallets.length) return;

  const walletAddress = wallets[0].address;
  const neurodex = new NeuroDexApi();

  try {
    // Refresh deposit
    if (callbackData === 'refresh_deposit') {
      const balance = await neurodex.getEthBalance(telegramId);
      const ethBalance = balance.success ? balance.data : '0.000';

      const message = depositMessage
        .replace('{ethBalance}', ethBalance || '0.000')
        .replace('{walletAddress}', walletAddress);

      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: depositKeyboard,
        link_preview_options: { is_disabled: true },
      });

      // Refresh wallet
    } else if (callbackData === 'refresh_wallet') {
      const balance = await neurodex.getEthBalance(telegramId);
      const ethBalance = balance.success ? balance.data : '0.000';

      const message = walletMessage
        .replace('{ethBalance}', ethBalance || '0.000')
        .replace('{walletAddress}', walletAddress);

      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: walletKeyboard,
        link_preview_options: { is_disabled: true },
      });

      // Refresh transactions (COMES SOOOOOOOOON BOIIII!!!)
    } else if (callbackData === 'refresh_transactions') {
      // TODO: Comes soon!
      return;
    }

    // Acknowledge the callback query to remove loading state
    await ctx.answerCallbackQuery();
  } catch (error: unknown) {
    // Handle case when message content hasn't changed | Important, cause we can't edit the message without new payload (good UX practice)
    if (error instanceof Error && error.message?.includes('message is not modified')) {
      await ctx.answerCallbackQuery({
        text: '✨ Already up to date!',
        show_alert: false,
      });
      return;
    } else {
      // Handle other errors
      console.error('Error in handleRefresh:', error);
      await ctx.answerCallbackQuery({
        text: '❌ Failed to refresh. Please try again.',
        show_alert: true,
      });
    }
  }
}

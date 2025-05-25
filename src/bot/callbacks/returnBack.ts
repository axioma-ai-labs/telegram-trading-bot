import { InlineKeyboard } from 'grammy';
import { BotContext } from '@/types/telegram';
import { startMessage, startKeyboard } from '@/bot/commands/start';
import { settingsMessage, settingsKeyboard } from '@/bot/commands/settings';
import { walletMessage, walletKeyboard } from '@/bot/commands/wallet';
import { transactionsMessage, transactionsKeyboard } from '@/bot/commands/transactions';
import { referralKeyboard, referralMessage } from '@/bot/commands/referrals';
import { getGasPriorityName, getLanguageName, getSlippageName } from '@/utils/settingsGetters';
import { ViemService } from '@/services/engine/viem.service';
import { validateUserAndWallet } from '@/utils/userValidation';

interface BackHandlerConfig {
  message: string | ((ctx: BotContext) => Promise<string>);
  keyboard: InlineKeyboard;
}

// Back handlers
export const BACK_HANDLERS: Record<string, BackHandlerConfig> = {
  back_start: {
    message: startMessage,
    keyboard: startKeyboard,
  },
  back_settings: {
    message: async (ctx: BotContext) => {
      const { isValid, user } = await validateUserAndWallet(ctx);
      if (!isValid) return '';

      return settingsMessage(
        getSlippageName(user?.settings?.slippage || '1'),
        getLanguageName(user?.settings?.language || 'en'),
        getGasPriorityName(user?.settings?.gasPriority || 'standard')
      );
    },
    keyboard: settingsKeyboard,
  },
  back_referrals: {
    message: async (ctx: BotContext) => {
      const { isValid, user } = await validateUserAndWallet(ctx);
      if (!isValid || !user) return '';

      const referralLink = user.referralCode || '';
      return referralMessage(referralLink);
    },
    keyboard: referralKeyboard,
  },
  back_wallet: {
    message: async (ctx: BotContext) => {
      const { isValid, user } = await validateUserAndWallet(ctx);
      if (!isValid || !user) return '';

      const viemService = new ViemService();
      const balance = await viemService.getNativeBalance(user.wallets[0].address as `0x${string}`);
      const ethBalance = balance || '0.000';

      return walletMessage(user.wallets[0].address, ethBalance);
    },
    keyboard: walletKeyboard,
  },
  back_transactions: {
    message: transactionsMessage,
    keyboard: transactionsKeyboard,
  },
};

// Return back (logic)
export async function returnBack(
  ctx: BotContext,
  message: string | ((ctx: BotContext) => Promise<string>),
  keyboard: InlineKeyboard
): Promise<void> {
  const finalMessage = typeof message === 'function' ? await message(ctx) : message;

  await ctx.editMessageText(finalMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

// Handle back navigation
export async function handleBackNavigation(
  ctx: BotContext,
  callbackData: string
): Promise<boolean> {
  const handler = BACK_HANDLERS[callbackData];
  if (handler) {
    await returnBack(ctx, handler.message, handler.keyboard);
    return true;
  }
  return false;
}

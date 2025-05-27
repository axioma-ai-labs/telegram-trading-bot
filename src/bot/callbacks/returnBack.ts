import { InlineKeyboard } from 'grammy';

import { referralKeyboard } from '@/bot/commands/referrals';
import { settingsKeyboard } from '@/bot/commands/settings';
import { startKeyboard } from '@/bot/commands/start';
import { transactionsKeyboard, transactionsMessage } from '@/bot/commands/transactions';
import { walletKeyboard } from '@/bot/commands/wallet';
import { ViemService } from '@/services/engine/viem';
import { BotContext } from '@/types/telegram';
import { getGasPriorityName, getLanguageName, getSlippageName } from '@/utils/settingsGetters';
import { validateUserAndWallet } from '@/utils/userValidation';

interface BackHandlerConfig {
  message: string | ((ctx: BotContext) => Promise<string>);
  keyboard: InlineKeyboard;
}

// Back handlers
export const BACK_HANDLERS: Record<string, BackHandlerConfig> = {
  back_start: {
    message: async (ctx: BotContext) => {
      return ctx.t('start_msg');
    },
    keyboard: startKeyboard,
  },
  back_settings: {
    message: async (ctx: BotContext) => {
      const { isValid, user } = await validateUserAndWallet(ctx);
      if (!isValid) return '';

      const message = ctx.t('settings_msg', {
        slippage: getSlippageName(user?.settings?.slippage || '1'),
        language: getLanguageName(user?.settings?.language || 'en'),
        gasPriority: getGasPriorityName(user?.settings?.gasPriority || 'standard'),
      });

      return message;
    },
    keyboard: settingsKeyboard,
  },
  back_referrals: {
    message: async (ctx: BotContext) => {
      const { isValid, user } = await validateUserAndWallet(ctx);
      if (!isValid || !user) return '';

      const referral_link = user.referralCode || '';
      const message = ctx.t('referral_msg', { referral_link });
      return message;
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

      const message = ctx.t('wallet_msg', {
        walletAddress: user.wallets[0].address,
        ethBalance,
      });

      return message;
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

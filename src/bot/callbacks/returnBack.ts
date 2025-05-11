import { InlineKeyboard } from 'grammy';
import { BotContext } from '@/types/config';
import { startMessage, startKeyboard } from '@/bot/commands/start';
import { settingsMessage, settingsKeyboard } from '@/bot/commands/settings';
import { walletMessage, walletKeyboard } from '@/bot/commands/wallet';
import { transactionsMessage, transactionsKeyboard } from '@/bot/commands/transactions';
import { referralKeyboard, referralMessage } from '../commands/referrals';
import { getGasPriorityName, getLanguageName, getSlippageName } from '@/utils/settingsGetters';

interface BackHandlerConfig {
  message: string;
  keyboard: InlineKeyboard;
}

// Back handlers
export const BACK_HANDLERS: Record<string, BackHandlerConfig> = {
  back_start: {
    message: startMessage,
    keyboard: startKeyboard,
  },
  back_settings: {
    message: settingsMessage(
      getSlippageName('0.5'),
      getLanguageName('en'),
      getGasPriorityName('medium')
    ),
    keyboard: settingsKeyboard,
  },
  back_referrals: {
    message: referralMessage('referralLink'),
    keyboard: referralKeyboard,
  },
  back_wallet: {
    message: walletMessage,
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
  message: string,
  keyboard: InlineKeyboard
): Promise<void> {
  await ctx.editMessageText(message, {
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

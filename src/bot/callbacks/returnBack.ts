import { InlineKeyboard } from 'grammy';

import { ordersKeyboard } from '@/bot/commands/orders';
import { referralKeyboard } from '@/bot/commands/referrals';
import { settingsKeyboard } from '@/bot/commands/settings';
import { startKeyboard } from '@/bot/commands/start';
import { transactionsKeyboard } from '@/bot/commands/transactions';
import { walletKeyboard } from '@/bot/commands/wallet';
import logger from '@/config/logger';
import { CoinStatsService } from '@/services/engine/coinstats';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { ViemService } from '@/services/engine/viem';
import { BotContext } from '@/types/telegram';
import { getGasPriorityName, getLanguageName, getSlippageName } from '@/utils/settingsGetters';
import { validateUser } from '@/utils/userValidation';

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
      const user = await validateUser(ctx, { cacheOnly: true });

      const message = ctx.t('settings_msg', {
        slippage: getSlippageName(user?.settings?.slippage || '1'),
        language: getLanguageName(user?.settings?.language || 'en'),
        gasPriority: getGasPriorityName(user?.settings?.gasPriority || 'standard'),
      });

      return message;
    },
    keyboard: settingsKeyboard,
  },
  back_orders: {
    message: async (ctx: BotContext) => {
      const user = await validateUser(ctx, { cacheOnly: true });

      const walletAddress = user.wallets[0].address;
      const neurodex = new NeuroDexApi();
      const totalDcaOrders = await neurodex.getDcaOrders({ address: walletAddress });
      const totalLimitOrders = await neurodex.getLimitOrders({
        address: walletAddress,
        statuses: [1, 2, 3, 4, 5, 6, 7],
      });
      if (!totalDcaOrders.success || !totalLimitOrders.success) {
        logger.error('Failed to get orders:', totalDcaOrders.error || totalLimitOrders.error);
        return ctx.t('error_msg');
      }

      const message = ctx.t('orders_overview_msg', {
        totalDcaOrders: totalDcaOrders.data?.length || 0,
        totalLimitOrders: totalLimitOrders.data?.length || 0,
      });

      return message;
    },
    keyboard: ordersKeyboard,
  },
  back_referrals: {
    message: async (ctx: BotContext) => {
      const user = await validateUser(ctx);

      const referral_link = user.referralCode || '';
      const message = ctx.t('referral_msg', { referral_link });
      return message;
    },
    keyboard: referralKeyboard,
  },
  back_wallet: {
    message: async (ctx: BotContext) => {
      const user = await validateUser(ctx, { cacheOnly: true });

      const viemService = new ViemService();
      const coinStatsService = CoinStatsService.getInstance();
      const walletAddress = user.wallets[0].address as `0x${string}`;

      const [balance, walletHoldings] = await Promise.all([
        viemService.getNativeBalance(user.wallets[0].address as `0x${string}`),
        coinStatsService.getWalletTokenHoldings(walletAddress, 'base', 0.1),
      ]);

      const ethBalance = balance || '0.000';

      const message = ctx.t('wallet_msg', {
        walletAddress: walletAddress,
        totalPortfolioValue: walletHoldings.totalPortfolioValue.toFixed(2),
        ethBalance,
        formattedBalances: walletHoldings.formattedBalances,
      });

      return message;
    },
    keyboard: walletKeyboard,
  },
  back_transactions: {
    message: async (ctx: BotContext) => {
      await validateUser(ctx, { cacheOnly: true });

      const message = ctx.t('transactions_msg');
      return message;
    },
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

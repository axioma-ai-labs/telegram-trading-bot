import { InlineKeyboard } from 'grammy';

import logger from '@/config/logger';
import { TransactionsService } from '@/services/prisma/transactions';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUser } from '@/utils/userValidation';

export const transactionsKeyboard = new InlineKeyboard()
  .text('Recent (10)', 'view_recent_transactions')
  .text('All', 'view_all_transactions')
  .row()
  .text('By Type', 'view_transactions_by_type')
  .text('Stats', 'view_transaction_stats')
  .row()
  .text('← Back', 'back_start');

export const transactionTypeKeyboard = new InlineKeyboard()
  .text('Buy', 'view_transactions_BUY')
  .text('Sell', 'view_transactions_SELL')
  .row()
  .text('DCA', 'view_transactions_DCA')
  .text('Limit Orders', 'view_transactions_LIMIT_ORDER')
  .row()
  .text('Withdrawals', 'view_transactions_WITHDRAW')
  .row()
  .text('← Back', 'view_transactions');

export const transactionsCommandHandler: CommandHandler = {
  command: 'transactions',
  description: 'View your transaction history',
  handler: async (ctx: BotContext): Promise<void> => {
    const user = await validateUser(ctx);

    try {
      const stats = await TransactionsService.getUserTransactionStats(user.id);

      const message = ctx.t('transactions_overview_msg', {
        totalTransactions: stats.totalTransactions,
        successfulTrades: stats.successfulTrades,
        failedTrades: stats.failedTrades,
        pendingTrades: stats.pendingTrades,
        totalVolume: stats.totalVolume.toFixed(4),
      });

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: transactionsKeyboard,
      });
    } catch (error) {
      logger.error('Error fetching transaction stats:', error);
      await ctx.reply(ctx.t('error_msg'));
    }
  },
};

import { TransactionType } from '@prisma/client/edge';
import { InlineKeyboard } from 'grammy';

import { transactionTypeKeyboard, transactionsKeyboard } from '@/bot/commands/transactions';
import logger from '@/config/logger';
import { TransactionsService } from '@/services/prisma/transactions';
import { BotContext } from '@/types/telegram';
import { formatTransaction } from '@/utils/formatters';
import { validateUser } from '@/utils/userValidation';

/**
 * View transactions menu
 */
export async function viewTransactions(ctx: BotContext): Promise<void> {
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.id) return;

  try {
    const stats = await TransactionsService.getUserTransactionStats(user.id);

    const message = ctx.t('transactions_overview_msg', {
      totalTransactions: stats.totalTransactions,
      successfulTrades: stats.successfulTrades,
      failedTrades: stats.failedTrades,
      pendingTrades: stats.pendingTrades,
      totalVolume: stats.totalVolume.toFixed(4),
    });

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: transactionsKeyboard,
    });
  } catch (error) {
    logger.error('Error fetching transaction stats:', error);
    await ctx.editMessageText(ctx.t('error_msg'), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text('← Back', 'back_start'),
    });
  }
}

/**
 * View recent transactions
 */
export async function viewRecentTransactions(ctx: BotContext): Promise<void> {
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.id) return;

  try {
    const transactions = await TransactionsService.getRecentTransactions(user.id, 10);

    if (transactions.length === 0) {
      await ctx.editMessageText(ctx.t('no_transactions_msg'), {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard().text('← Back', 'view_transactions'),
      });
      return;
    }

    let message = ctx.t('recent_transactions_header_msg') + '\n\n';

    transactions.forEach((transaction, index) => {
      message += formatTransaction(transaction, index, ctx.t) + '\n\n';
    });

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text('← Back', 'view_transactions'),
      link_preview_options: {
        is_disabled: true,
      },
    });
  } catch (error) {
    logger.error('Error fetching recent transactions:', error);
    await ctx.editMessageText(ctx.t('error_msg'), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text('← Back', 'view_transactions'),
    });
  }
}

/**
 * View all transactions with pagination
 */
export async function viewAllTransactions(ctx: BotContext, page: number = 1): Promise<void> {
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.id) return;

  try {
    const result = await TransactionsService.getUserTransactions(user.id, {
      page,
      limit: 10,
    });

    if (result.transactions.length === 0) {
      await ctx.editMessageText(ctx.t('no_transactions_msg'), {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard().text('← Back', 'view_transactions'),
      });
      return;
    }

    let message =
      ctx.t('all_transactions_header_msg', {
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
      }) + '\n\n';

    result.transactions.forEach((transaction, index) => {
      message += formatTransaction(transaction, index, ctx.t) + '\n\n';
    });

    const keyboard = new InlineKeyboard();

    // Pagination buttons
    if (result.page > 1) {
      keyboard.text('← Previous', `view_all_transactions_${result.page - 1}`);
    }
    if (result.page < result.totalPages) {
      keyboard.text('Next →', `view_all_transactions_${result.page + 1}`);
    }
    keyboard.row().text('← Back', 'view_transactions');

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  } catch (error) {
    logger.error('Error fetching all transactions:', error);
    await ctx.editMessageText(ctx.t('error_msg'), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text('← Back', 'view_transactions'),
    });
  }
}

/**
 * View transactions by type menu
 */
export async function viewTransactionsByType(ctx: BotContext): Promise<void> {
  await ctx.editMessageText(ctx.t('select_transaction_type_msg'), {
    parse_mode: 'Markdown',
    reply_markup: transactionTypeKeyboard,
  });
}

/**
 * View transactions of specific type
 */
export async function viewTransactionsOfType(
  ctx: BotContext,
  type: TransactionType,
  page: number = 1
): Promise<void> {
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.id) return;

  try {
    const result = await TransactionsService.getTransactionsByTypeAndStatus(
      user.id,
      type,
      undefined,
      {
        page,
        limit: 10,
      }
    );

    if (result.transactions.length === 0) {
      await ctx.editMessageText(ctx.t('no_transactions_of_type_msg', { type }), {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard().text('← Back', 'view_transactions_by_type'),
      });
      return;
    }

    let message =
      ctx.t('transactions_of_type_header_msg', {
        type,
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
      }) + '\n\n';

    result.transactions.forEach((transaction, index) => {
      message += formatTransaction(transaction, index, ctx.t) + '\n\n';
    });

    const keyboard = new InlineKeyboard();

    // Pagination buttons
    if (result.page > 1) {
      keyboard.text('← Previous', `view_transactions_${type}_${result.page - 1}`);
    }
    if (result.page < result.totalPages) {
      keyboard.text('Next →', `view_transactions_${type}_${result.page + 1}`);
    }
    keyboard.row().text('← Back', 'view_transactions_by_type');

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  } catch (error) {
    logger.error(`Error fetching ${type} transactions:`, error);
    await ctx.editMessageText(ctx.t('error_msg'), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text('← Back', 'view_transactions_by_type'),
    });
  }
}

/**
 * View transaction statistics
 */
export async function viewTransactionStats(ctx: BotContext): Promise<void> {
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.id) return;

  try {
    const stats = await TransactionsService.getUserTransactionStats(user.id);

    let message = ctx.t('transaction_stats_header_msg') + '\n\n';

    message +=
      ctx.t('transaction_stats_overview_msg', {
        totalTransactions: stats.totalTransactions,
        successfulTrades: stats.successfulTrades,
        failedTrades: stats.failedTrades,
        pendingTrades: stats.pendingTrades,
        totalVolume: stats.totalVolume.toFixed(4),
      }) + '\n\n';

    message += ctx.t('transaction_stats_by_type_msg') + '\n';
    Object.entries(stats.byType).forEach(([type, count]) => {
      message += `• ${type}: ${count}\n`;
    });

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text('← Back', 'view_transactions'),
    });
  } catch (error) {
    logger.error('Error fetching transaction stats:', error);
    await ctx.editMessageText(ctx.t('error_msg'), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text('← Back', 'view_transactions'),
    });
  }
}

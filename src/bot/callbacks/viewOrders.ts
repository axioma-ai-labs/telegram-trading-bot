import { InlineKeyboard } from 'grammy';

import {
  cancelDcaOrderKeyboard,
  cancelLimitOrderKeyboard,
  ordersKeyboard,
} from '@/bot/commands/orders';
import logger from '@/config/logger';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { BotContext } from '@/types/telegram';
import { formatDcaOrder, formatLimitOrder } from '@/utils/formatters';
import { validateUserAndWallet } from '@/utils/userValidation';

// view limit orders
export async function viewLimitOrders(ctx: BotContext): Promise<void> {
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid || !user?.wallets?.[0]) return;

  const walletAddress = user.wallets[0].address;
  const neurodex = new NeuroDexApi();

  // Fetch limit orders for all statuses
  const ordersResult = await neurodex.getLimitOrders(
    {
      address: walletAddress,
      statuses: [1, 2, 3, 4, 5, 6, 7], // All possible statuses
      limit: 50,
    },
    'base'
  );

  if (!ordersResult.success) {
    logger.error('Failed to fetch limit orders:', ordersResult.error);
    await ctx.editMessageText(ctx.t('error_msg'), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text('← Back', 'back_orders'),
    });
    return;
  }

  const orders = ordersResult.data || [];

  if (orders.length === 0) {
    await ctx.editMessageText(ctx.t('no_limit_orders_msg'), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text('← Back', 'back_orders'),
    });
    return;
  }

  // Format orders
  let message = ctx.t('limit_orders_header_msg') + '\n\n';

  orders.forEach((order, index) => {
    message += formatLimitOrder(order, index, ctx.t) + '\n\n';
  });

  message += ctx.t('orders_total_count_msg', { totalCount: orders.length });

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: cancelLimitOrderKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

/**
 * View DCA orders for the user.
 *
 * Fetches and displays all DCA orders for the user's wallet address.
 * Shows order details including token pairs, amounts, intervals, and progress.
 *
 * @param ctx - The bot context containing user session and message data
 */
export async function viewDcaOrders(ctx: BotContext): Promise<void> {
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid || !user?.wallets?.[0]) return;

  const walletAddress = user.wallets[0].address;
  const neurodex = new NeuroDexApi();

  // Fetch DCA orders for all statuses
  const ordersResult = await neurodex.getDcaOrders(
    {
      address: walletAddress,
      statuses: [1, 2, 3, 4, 5, 6, 7], // All possible statuses
      limit: 50,
    },
    'base'
  );

  if (!ordersResult.success) {
    logger.error('Failed to fetch DCA orders:', ordersResult.error);
    await ctx.editMessageText(ctx.t('error_msg'), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text('← Back', 'back_orders'),
    });
    return;
  }

  const orders = ordersResult.data || [];

  if (orders.length === 0) {
    await ctx.editMessageText(ctx.t('no_dca_orders_msg'), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text('← Back', 'back_orders'),
    });
    return;
  }

  // Format orders
  let message = ctx.t('dca_orders_header_msg') + '\n\n';

  orders.forEach((order, index) => {
    message += formatDcaOrder(order, index, ctx.t) + '\n\n';
  });

  message += ctx.t('orders_total_count_msg', { totalCount: orders.length });

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: cancelDcaOrderKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

export async function showOrders(ctx: BotContext): Promise<void> {
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid || !user?.wallets?.[0]) return;

  const walletAddress = user.wallets[0].address;
  const neurodex = new NeuroDexApi();

  // Fetch both DCA and limit orders
  const totalDcaOrders = await neurodex.getDcaOrders({ address: walletAddress });
  const totalLimitOrders = await neurodex.getLimitOrders({
    address: walletAddress,
    statuses: [1, 2, 3, 4, 5, 6, 7],
  });

  if (!totalDcaOrders.success || !totalLimitOrders.success) {
    logger.error('Failed to get orders:', totalDcaOrders.error || totalLimitOrders.error);
    await ctx.editMessageText(ctx.t('error_msg'), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text('← Back', 'back_start'),
    });
    return;
  }

  const message = ctx.t('orders_overview_msg', {
    totalDcaOrders: totalDcaOrders.data?.length || 0,
    totalLimitOrders: totalLimitOrders.data?.length || 0,
  });

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: ordersKeyboard,
  });
}

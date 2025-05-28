import { InlineKeyboard } from 'grammy';

import logger from '@/config/logger';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

export const ordersKeyboard = new InlineKeyboard()
  .text('Limit Orders', 'view_limit_orders')
  .row()
  .text('DCA Orders', 'view_dca_orders')
  .row()
  .text('← Back', 'back_start');

export const cancelLimitOrderKeyboard = new InlineKeyboard()
  .text('Cancel', 'cancel_limit_order')
  .row()
  .text('Back', 'back_orders');

export const cancelDcaOrderKeyboard = new InlineKeyboard()
  .text('Cancel', 'cancel_dca_order')
  .row()
  .text('Back', 'back_orders');

export const ordersCommandHandler: CommandHandler = {
  command: 'orders',
  description: 'View your limit & DCAorders',
  handler: async (ctx: BotContext): Promise<void> => {
    const { isValid, user } = await validateUserAndWallet(ctx);
    if (!isValid || !user?.wallets?.[0]) return;

    const walletAddress = user.wallets[0].address;
    const neurodex = new NeuroDexApi();
    const totalDcaOrders = await neurodex.getDcaOrders({ address: walletAddress });
    const totalLimitOrders = await neurodex.getLimitOrders({
      address: walletAddress,
      statuses: [1, 2, 3, 4, 5, 6, 7],
    });
    if (!totalDcaOrders.success || !totalLimitOrders.success) {
      logger.error('Failed to get orders:', totalDcaOrders.error || totalLimitOrders.error);
      await ctx.reply(ctx.t('error_msg'));
      return;
    }

    const message = ctx.t('orders_overview_msg', {
      totalDcaOrders: totalDcaOrders.data?.length || 0,
      totalLimitOrders: totalLimitOrders.data?.length || 0,
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: ordersKeyboard,
    });
  },
};

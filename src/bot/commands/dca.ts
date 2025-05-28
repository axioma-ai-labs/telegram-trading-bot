import { InlineKeyboard } from 'grammy';

import { getDcaOrders } from '@/bot/callbacks/handleDCA';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUser } from '@/utils/userValidation';

export const dcaTokenKeyboard = new InlineKeyboard()
  .text('0.1 ETH', 'dca_amount_0.1')
  .text('0.2 ETH', 'dca_amount_0.2')
  .text('1 ETH', 'dca_amount_1')
  .row()
  .text('2 ETH', 'dca_amount_2')
  .text('5 ETH', 'dca_amount_5')
  .row()
  .text('Custom', 'dca_amount_custom');

export const intervalKeyboard = new InlineKeyboard()
  .text('1 hour', 'dca_interval_3600')
  .text('1 day', 'dca_interval_86400')
  .text('1 week', 'dca_interval_604800')
  .text('1 month', 'dca_interval_2592000')
  .row()
  .text('Custom', 'dca_interval_custom');

export const timesKeyboard = new InlineKeyboard()
  .text('5', 'dca_times_5')
  .text('10', 'dca_times_10')
  .text('15', 'dca_times_15')
  .text('20', 'dca_times_20')
  .text('30', 'dca_times_30')
  .row()
  .text('Custom', 'dca_times_custom');

export const confirmDcaKeyboard = new InlineKeyboard()
  .text('✅ Confirm', 'dca_confirm')
  .text('❌ Cancel', 'dca_cancel');

export const dcaCommandHandler: CommandHandler = {
  command: 'dca',
  description: 'Create a DCA order',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid } = await validateUser(ctx);
    if (!isValid) return;

    ctx.session.currentOperation = { type: 'dca' };

    await ctx.reply(ctx.t('dca_token_msg'), {
      parse_mode: 'Markdown',
    });
  },
};

export const dcaOrdersCommandHandler: CommandHandler = {
  command: 'orders',
  description: 'Get DCA orders',
  handler: async (ctx: BotContext): Promise<void> => {
    await getDcaOrders(ctx);
  },
};

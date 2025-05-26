import { InlineKeyboard } from 'grammy';

import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

export const buyTokenKeyboard = new InlineKeyboard()
  .text('0.1 ETH', 'buy_amount_0.1')
  .text('0.2 ETH', 'buy_amount_0.2')
  .text('1 ETH', 'buy_amount_1')
  .row()
  .text('2 ETH', 'buy_amount_2')
  .text('5 ETH', 'buy_amount_5')
  .row()
  .text('Custom', 'buy_amount_custom');

export const confirmBuyKeyboard = new InlineKeyboard()
  .text('✅ Confirm', 'buy_confirm')
  .text('❌ Cancel', 'buy_cancel');

export const buyCommandHandler: CommandHandler = {
  command: 'buy',
  description: 'Buy a token',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid } = await validateUserAndWallet(ctx);
    if (!isValid) return;

    ctx.session.currentOperation = { type: 'buy' };

    await ctx.reply(ctx.t('buy_token_msg'), {
      parse_mode: 'Markdown',
    });
  },
};

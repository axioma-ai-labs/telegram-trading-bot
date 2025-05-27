import { InlineKeyboard } from 'grammy';

import { ViemService } from '@/services/engine/viem.service';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

export const withdrawAmountKeyboard = new InlineKeyboard()
  .text('0.001 ETH', 'withdraw_amount_0.001')
  .text('0.01 ETH', 'withdraw_amount_0.01')
  .text('0.1 ETH', 'withdraw_amount_0.1')
  .row()
  .text('0.5 ETH', 'withdraw_amount_0.5')
  .text('1 ETH', 'withdraw_amount_1')
  .row()
  .text('Custom', 'withdraw_amount_custom')
  .row()
  .text('← Back', 'back_wallet');

export const confirmWithdrawKeyboard = new InlineKeyboard()
  .text('✅ Confirm', 'withdraw_confirm')
  .text('❌ Cancel', 'withdraw_cancel');

export const withdrawKeyboard = new InlineKeyboard().text('← Back', 'back_wallet');

export const withdrawCommandHandler: CommandHandler = {
  command: 'withdraw',
  description: 'Withdraw tokens',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid, user } = await validateUserAndWallet(ctx);
    if (!isValid || !user) return;

    // Set current operation
    ctx.session.currentOperation = { type: 'withdraw' };

    const viemService = new ViemService();
    const ethBalance = await viemService.getNativeBalance(user.wallets[0].address as `0x${string}`);

    const message = ctx.t('withdraw_select_amount_msg', {
      ethBalance: ethBalance || '0.000',
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: withdrawAmountKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  },
};

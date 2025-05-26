import { InlineKeyboard } from 'grammy';

import { ViemService } from '@/services/engine/viem.service';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

export const withdrawKeyboard = new InlineKeyboard().text('← Back', 'back_wallet');

export const withdrawCommandHandler: CommandHandler = {
  command: 'withdraw',
  description: 'Withdraw tokens',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid, user } = await validateUserAndWallet(ctx);
    if (!isValid || !user) return;

    const viemService = new ViemService();
    const ethBalance = await viemService.getNativeBalance(user.wallets[0].address as `0x${string}`);
    const message = ctx.t('withdraw_msg', {
      ethBalance: ethBalance || '0.000',
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: withdrawKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  },
};

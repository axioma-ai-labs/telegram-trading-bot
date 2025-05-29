import { InlineKeyboard } from 'grammy';

import { ViemService } from '@/services/engine/viem';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUser } from '@/utils/userValidation';

export const depositKeyboard = new InlineKeyboard()
  .text('← Back', 'back_start')
  .text('↺ Refresh', 'refresh_deposit');

export const depositCommandHandler: CommandHandler = {
  command: 'deposit',
  description: 'Display your wallet address for deposits',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const user = await validateUser(ctx);

    const viemService = new ViemService();
    const balance = await viemService.getNativeBalance(user?.wallets[0].address as `0x${string}`);
    const ethBalance = balance || '0.000';
    const message = ctx.t('deposit_msg', {
      walletAddress: user.wallets[0].address,
      ethBalance,
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: depositKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  },
};

export default depositCommandHandler;

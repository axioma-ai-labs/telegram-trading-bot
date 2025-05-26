import { InlineKeyboard } from 'grammy';

import { createWalletKeyboard } from '@/bot/commands/wallet';
import logger from '@/config/logger';
import { ViemService } from '@/services/engine/viem.service';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

export const withdrawMessage = (ethBalance: string): string => `📤 *Withdraw ETH or other tokens*

Your balance: 
- ETH: ${ethBalance}

*Important*:
- Double check the receiving address
- Withdrawals usually confirm within minutes
- Never share your private key with anyone`;

export const withdrawKeyboard = new InlineKeyboard().text('← Back', 'back_wallet');

export const withdrawCommandHandler: CommandHandler = {
  command: 'withdraw',
  description: 'Withdraw tokens',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid, user } = await validateUserAndWallet(ctx);
    if (!isValid || !user) return;

    if (!user.wallets || user.wallets.length === 0) {
      await ctx.reply("⚠️ You don't have a wallet yet.\n\nYou need to create a new wallet first:", {
        parse_mode: 'Markdown',
        reply_markup: createWalletKeyboard,
      });
      return;
    }

    const viemService = new ViemService();
    const ethBalance = await viemService.getNativeBalance(user.wallets[0].address as `0x${string}`);
    const message = withdrawMessage(ethBalance || '0.000');

    logger.info('Withdraw message:', message);

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: withdrawKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  },
};

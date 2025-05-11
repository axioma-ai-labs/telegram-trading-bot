import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { createWalletMessage, createWalletKeyboard } from '@/bot/commands/wallet';
import { hasWallet } from '@/utils/checkUser';

export const buyTokenMessage = `Enter a token symbol or address to buy:`;

export const buyCommandHandler: CommandHandler = {
  command: 'buy',
  description: 'Buy a token',
  handler: async (ctx: BotContext): Promise<void> => {
    if (!ctx.from?.id) {
      return;
    }

    const telegramId = ctx.from.id.toString();
    const USER_HAS_WALLET = await hasWallet(telegramId);

    if (!USER_HAS_WALLET) {
      await ctx.reply(createWalletMessage, {
        parse_mode: 'Markdown',
        reply_markup: createWalletKeyboard,
      });
    } else {
      await ctx.reply(buyTokenMessage, {
        parse_mode: 'Markdown',
      });
    }
  },
};

import { CommandHandler } from '../../types/commands';
import { BotContext } from '../../types/config';
import { newUserStartMessage, newUserStartKeyboard } from './start';
import { hasWallet } from '../../utils/checkUser';

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

    if (USER_HAS_WALLET) {
      await ctx.reply(buyTokenMessage, {
        parse_mode: 'Markdown',
      });
    } else {
      await ctx.reply(newUserStartMessage, {
        parse_mode: 'Markdown',
        reply_markup: newUserStartKeyboard,
      });
    }
  },
};

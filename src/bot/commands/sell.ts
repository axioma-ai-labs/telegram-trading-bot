import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { validateUserAndWallet } from '@/utils/userValidation';

export const sellTokenMessage = `Enter a token symbol or address to sell:`;

export const sellCommandHandler: CommandHandler = {
  command: 'sell',
  description: 'Sell a token',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid } = await validateUserAndWallet(ctx);
    if (!isValid) return;

    await ctx.reply(sellTokenMessage, {
      parse_mode: 'Markdown',
    });
  },
};

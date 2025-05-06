import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { IS_NEW_USER } from '@/config/mock';
import { deleteBotMessage } from '@/utils/deleteMessage';

export const sellTokenMessage = `Enter a token symbol or address to sell:`;

export const sellCommandHandler: CommandHandler = {
  command: 'sell',
  description: 'Sell a token',
  handler: async (ctx: BotContext): Promise<void> => {
    // Case 1: User is not registered
    if (IS_NEW_USER) {
      const message = await ctx.reply(`❌ You are not registered.\n\nPlease use /start to begin.`);
      await deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    await ctx.reply(sellTokenMessage, {
      parse_mode: 'Markdown',
    });
  },
};

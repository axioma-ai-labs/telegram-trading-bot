import { BotContext } from '@/types/config';
import { IS_NEW_USER } from '@/config/mock';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { sellTokenMessage } from '@/bot/commands/sell';

export async function sellToken(ctx: BotContext): Promise<void> {
  // Case 1: User is not registered | works
  if (IS_NEW_USER) {
    const message = await ctx.reply(`❌ You are not registered.\n\nPlease use /start to begin.`);
    await deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  await ctx.reply(sellTokenMessage, {
    parse_mode: 'Markdown',
  });
}

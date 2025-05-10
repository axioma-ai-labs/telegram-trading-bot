import { IS_NEW_USER } from '../../config/mock';
import { BotContext } from '../../types/config';
import { deleteBotMessage } from '../../utils/deleteMessage';
import { buyTokenMessage } from '../commands/buy';
export async function buyToken(ctx: BotContext): Promise<void> {
  // Case 1: User is not registered | works
  if (IS_NEW_USER) {
    const message = await ctx.reply(`❌ You are not registered.\n\nPlease use /start to begin.`);
    await deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  await ctx.reply(buyTokenMessage, {
    parse_mode: 'Markdown',
  });
}

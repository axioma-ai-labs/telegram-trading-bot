import { BotContext } from '@/types/telegram';
import logger from '@/config/logger';

/**
 * Deletes a bot message after an optional delay.
 *
 * @param ctx The bot context
 * @param messageId ID of the message to delete
 * @param delayMs Delay in milliseconds before deletion (default: 10000ms)
 * @returns Promise that resolves when the deletion is complete or fails
 */
export const deleteBotMessage = async (
  ctx: BotContext,
  messageId: number,
  delayMs = 10000
): Promise<boolean> => {
  if (!ctx.chat?.id) {
    logger.error('Cannot delete message: chat ID not available');
    return false;
  }

  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        await ctx.api.deleteMessage(ctx.chat!.id, messageId);
        resolve(true);
      } catch (error) {
        logger.error('Error deleting message:', error);
        resolve(false);
      }
    }, delayMs);
  });
};

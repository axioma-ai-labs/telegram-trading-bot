import logger from '@/config/logger';
import { BotContext } from '@/types/telegram';

/**
 * Deletes a bot message after an optional delay.
 *
 * @param ctx The bot context
 * @param messageId ID of the message to delete
 * @param delayMs Delay in milliseconds before deletion (default: 10000ms)
 * @returns Promise that resolves when the deletion is complete or fails
 */
export const deleteBotMessage = (ctx: BotContext, messageId: number, delayMs = 10000): void => {
  if (!ctx.chat?.id) {
    logger.error('Cannot delete message: chat ID not available');
    return;
  }

  // Schedule deletion without blocking
  setTimeout(async () => {
    try {
      await ctx.api.deleteMessage(ctx.chat!.id, messageId);
    } catch (error) {
      logger.error('Error deleting message:', error);
    }
  }, delayMs);
};

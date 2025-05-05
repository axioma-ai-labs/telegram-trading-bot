import { Context } from 'grammy';

/**
 * Deletes a message from a chat.
 * 
 * @param ctx - The context containing the message to delete
 * @returns Promise resolving to true if deletion was successful, false otherwise
 */
export const deleteMessage = async (ctx: Context): Promise<boolean> => {
  try {
    // Make sure we have chat_id and message_id
    if (!ctx.chat?.id || !ctx.message?.message_id) {
      return false;
    }
    
    // Delete the message
    await ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id);
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
};

/**
 * Deletes a specific message by chat ID and message ID.
 * 
 * @param ctx - The context with API access
 * @param chatId - The chat ID where the message is located
 * @param messageId - The ID of the message to delete
 * @returns Promise resolving to true if deletion was successful, false otherwise
 */
export const deleteMessageById = async (
  ctx: Context,
  chatId: number,
  messageId: number
): Promise<boolean> => {
  try {
    await ctx.api.deleteMessage(chatId, messageId);
    return true;
  } catch (error) {
    console.error('Error deleting message by ID:', error);
    return false;
  }
};

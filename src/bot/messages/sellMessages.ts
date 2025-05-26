import { performSell } from '@/bot/callbacks/sellToken';
import { sellTokenKeyboard } from '@/bot/commands/sell';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { BotContext, OperationState } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';

/**
 * Handles sell operation messages from users.
 *
 * This function processes user input for sell operations, handling both
 * token contract address input and amount input based on the current
 * operation state.
 *
 * @param ctx - The bot context containing session and message data
 * @param userInput - The user's text input
 * @param currentOperation - The current operation from session
 */
export async function handleSellMessages(
  ctx: BotContext,
  userInput: string,
  currentOperation: OperationState
): Promise<void> {
  if (!currentOperation.token) {
    // Handle token input
    try {
      const neurodex = new NeuroDexApi();
      const tokenData = await neurodex.getTokenDataByContractAddress(userInput, 'base');

      ctx.session.currentOperation = {
        type: 'sell',
        token: userInput,
        tokenSymbol: tokenData.data?.symbol,
        tokenName: tokenData.data?.name,
        tokenChain: tokenData.data?.chain,
      };

      const message = ctx.t('sell_token_found_msg', {
        tokenSymbol: tokenData.data?.symbol || '',
        tokenName: tokenData.data?.name || '',
        tokenPrice: tokenData.data?.price || 0,
        tokenChain: tokenData.data?.chain || '',
      });

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: sellTokenKeyboard,
      });
    } catch (error) {
      await ctx.reply(ctx.t('token_not_found_msg'), {
        parse_mode: 'Markdown',
      });
    }
  } else if (!currentOperation.amount) {
    // Handle amount input
    const parsedAmount = parseFloat(userInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      const invalid_amount_message = await ctx.reply(ctx.t('invalid_amount_msg'));
      await deleteBotMessage(ctx, invalid_amount_message.message_id);
      return;
    }
    await performSell(ctx, parsedAmount.toString());
  }
}

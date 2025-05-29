import { performBuy } from '@/bot/callbacks/buyToken';
import { buyTokenKeyboard } from '@/bot/commands/buy';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { BotContext, OperationState } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';

/**
 * Handles buy operation messages from users.
 *
 * This function processes user input for buy operations, handling both
 * token contract address input and amount input based on the current
 * operation state.
 *
 * @param ctx - The bot context containing session and message data
 * @param userInput - The user's text input
 * @param currentOperation - The current operation from session
 */
export async function handleBuyMessages(
  ctx: BotContext,
  userInput: string,
  currentOperation: OperationState
): Promise<void> {
  if (!currentOperation.token) {
    // Handle token input
    const neurodex = new NeuroDexApi();
    const tokenData = await neurodex.getTokenDataByContractAddress(userInput, 'base');

    if (!tokenData.success || !tokenData.data) {
      const message = await ctx.reply(ctx.t('token_not_found_msg'), {
        parse_mode: 'Markdown',
      });
      deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    ctx.session.currentOperation = {
      type: 'buy',
      token: userInput,
      tokenSymbol: tokenData.data?.symbol,
      tokenName: tokenData.data?.name,
      tokenChain: tokenData.data?.chain,
    };

    const message = ctx.t('buy_token_found_msg', {
      tokenSymbol: tokenData.data?.symbol || '',
      tokenName: tokenData.data?.name || '',
      tokenPrice: tokenData.data?.price || 0,
      tokenChain: tokenData.data?.chain || '',
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: buyTokenKeyboard,
    });
  } else if (!currentOperation.amount) {
    // Handle amount input
    const parsedAmount = parseFloat(userInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      const invalid_amount_message = await ctx.reply(ctx.t('invalid_amount_msg'));
      deleteBotMessage(ctx, invalid_amount_message.message_id);
      return;
    }
    await performBuy(ctx, parsedAmount.toString());
  }
}

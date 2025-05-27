import { performWithdraw, setRecipientAddress } from '@/bot/callbacks/withdrawFunds';
import { BotContext } from '@/types/telegram';
import { OperationState } from '@/types/telegram';

/**
 * Handle withdrawal-related text messages
 * @param ctx - Bot context
 * @param userInput - User's text input
 * @param currentOperation - Current operation state
 */
export async function handleWithdrawMessages(
  ctx: BotContext,
  userInput: string,
  currentOperation: OperationState
): Promise<void> {
  // Handle recipient address input
  if (currentOperation.amount && !currentOperation.recipientAddress) {
    await setRecipientAddress(ctx, userInput.trim());
    return;
  }

  // Handle custom amount input
  if (!currentOperation.amount) {
    const amount = parseFloat(userInput.trim());
    if (!isNaN(amount) && amount > 0) {
      // Use performWithdraw to handle the amount
      await performWithdraw(ctx, userInput.trim());
      return;
    }
  }

  // If we reach here, the input is invalid
  await ctx.reply(ctx.t('invalid_input_msg'), {
    parse_mode: 'Markdown',
  });
}

import {
  handleCustomExpiry,
  handleLimitBuyTargetAmount,
  handleLimitSellTargetPrice,
  handleLimitTokenInput,
} from '@/bot/callbacks/handleLimitOrders';
import { BotContext, OperationState } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { validateExpiryTime } from '@/utils/validators';

/**
 * Handles limit order operation messages from users.
 *
 * This function processes user input for limit order operations based on the
 * current operation state and subType (buy vs sell). It routes messages to
 * appropriate handlers for each step of the limit order creation process.
 *
 * @param ctx - The bot context containing session and message data
 * @param userInput - The user's text input
 * @param currentOperation - The current operation from session
 */
export async function handleLimitMessages(
  ctx: BotContext,
  userInput: string,
  currentOperation: OperationState
): Promise<void> {
  // Handle token address input
  if (!currentOperation.token && currentOperation.subType) {
    await handleLimitTokenInput(ctx, userInput.trim());
    return;
  }

  // Handle custom amount input for buy orders
  if (
    currentOperation.subType === 'buy' &&
    currentOperation.token &&
    !currentOperation.fromAmount
  ) {
    const parsedAmount = parseFloat(userInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      const message = await ctx.reply(ctx.t('invalid_amount_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    ctx.session.currentOperation = {
      ...currentOperation,
      fromAmount: parsedAmount,
    };

    await ctx.reply(ctx.t('limit_buy_target_amount_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  }

  // Handle custom amount input for sell orders
  if (
    currentOperation.subType === 'sell' &&
    currentOperation.token &&
    !currentOperation.fromAmount
  ) {
    const parsedAmount = parseFloat(userInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      const message = await ctx.reply(ctx.t('invalid_amount_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    // Check if user has enough balance
    const totalBalance = parseFloat(currentOperation.tokenBalance || '0');
    if (parsedAmount > totalBalance) {
      const message = await ctx.reply(
        ctx.t('limit_sell_insufficient_balance_msg', {
          balance: totalBalance.toString(),
          tokenSymbol: currentOperation.tokenSymbol || 'TOKEN',
        })
      );
      deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    ctx.session.currentOperation = {
      ...currentOperation,
      fromAmount: parsedAmount,
    };

    await ctx.reply(ctx.t('limit_sell_target_price_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  }

  // Handle custom target amount input for buy orders
  if (
    currentOperation.subType === 'buy' &&
    currentOperation.fromAmount &&
    !currentOperation.toAmount
  ) {
    await handleLimitBuyTargetAmount(ctx, userInput.trim());
    return;
  }

  // Handle custom target price input for sell orders
  if (
    currentOperation.subType === 'sell' &&
    currentOperation.fromAmount &&
    !currentOperation.toAmount
  ) {
    await handleLimitSellTargetPrice(ctx, userInput.trim());
    return;
  }

  // Handle custom expiry input
  if (currentOperation.toAmount && !currentOperation.expiry) {
    const validation = validateExpiryTime(userInput.trim());
    if (!validation.isValid) {
      const message = await ctx.reply(ctx.t('limit_invalid_expiry_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    await handleCustomExpiry(ctx, userInput.trim());
    return;
  }

  // If we reach here, the input doesn't match expected flow
  const message = await ctx.reply(ctx.t('invalid_input_msg'));
  deleteBotMessage(ctx, message.message_id, 10000);
}

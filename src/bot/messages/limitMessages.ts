import {
  retrieveLimitExpiry,
  retrieveLimitPrice,
  retrieveLimitTargetToken,
} from '@/bot/callbacks/handleLimitOrders';
import { limitAmountKeyboard, limitTargetTokenKeyboard } from '@/bot/commands/limit';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { BotContext, OperationState } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';

/**
 * Handles limit order operation messages from users.
 *
 * This function processes user input for limit order operations, handling
 * token contract address input, amount input, target token input, price input,
 * and expiry input based on the current operation state.
 *
 * Flow: token -> amount -> target token -> price -> expiry -> confirm
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
  if (!currentOperation.token) {
    // Handle token input (token to sell)
    const neurodex = new NeuroDexApi();
    const tokenData = await neurodex.getTokenDataByContractAddress(userInput, 'base');

    if (!tokenData.success || !tokenData.data) {
      const message = await ctx.reply(ctx.t('token_not_found_msg'), {
        parse_mode: 'Markdown',
      });
      await deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    ctx.session.currentOperation = {
      type: 'limit',
      token: userInput,
      tokenSymbol: tokenData.data?.symbol,
      tokenName: tokenData.data?.name,
      tokenChain: tokenData.data?.chain,
    };

    const message = ctx.t('limit_token_found_msg', {
      tokenSymbol: tokenData.data?.symbol || '',
      tokenName: tokenData.data?.name || '',
      tokenPrice: tokenData.data?.price || 0,
      tokenChain: tokenData.data?.chain || '',
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: limitAmountKeyboard,
    });
  } else if (!currentOperation.amount) {
    // Handle amount input
    const parsedAmount = parseFloat(userInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      const message = await ctx.reply(ctx.t('invalid_amount_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    ctx.session.currentOperation = {
      ...currentOperation,
      amount: parsedAmount,
    };

    // Ask for target token (what user wants to receive)
    await ctx.reply(ctx.t('limit_target_token_msg'), {
      parse_mode: 'Markdown',
      reply_markup: limitTargetTokenKeyboard,
    });
  } else if (!currentOperation.targetToken) {
    // Handle custom target token input
    const neurodex = new NeuroDexApi();
    const tokenData = await neurodex.getTokenDataByContractAddress(userInput, 'base');

    if (!tokenData.success || !tokenData.data) {
      const message = await ctx.reply(ctx.t('token_not_found_msg'), {
        parse_mode: 'Markdown',
      });
      await deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    await retrieveLimitTargetToken(ctx, userInput);
  } else if (!currentOperation.price) {
    // Handle price input
    const parsedPrice = parseFloat(userInput);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      const message = await ctx.reply(ctx.t('limit_invalid_price_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    await retrieveLimitPrice(ctx, parsedPrice.toString());
  } else if (!currentOperation.expiry) {
    // Handle expiry input
    const expiryPattern = /^(\d+)([HDWM])$/i;
    if (!expiryPattern.test(userInput)) {
      const message = await ctx.reply(ctx.t('limit_invalid_expiry_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    await retrieveLimitExpiry(ctx, userInput.toUpperCase());
  }
}

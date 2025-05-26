import {
  confirmDcaKeyboard,
  dcaTokenKeyboard,
  intervalKeyboard,
  timesKeyboard,
} from '@/bot/commands/dca';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { BotContext, OperationState } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { isValidDcaAmount, isValidDcaInterval } from '@/utils/validators';

/**
 * Handles DCA (Dollar Cost Averaging) operation messages from users.
 *
 * This function processes user input for DCA operations, handling token
 * contract address input, amount input, interval input, and times input
 * based on the current operation state.
 *
 * @param ctx - The bot context containing session and message data
 * @param userInput - The user's text input
 * @param currentOperation - The current operation from session
 */
export async function handleDcaMessages(
  ctx: BotContext,
  userInput: string,
  currentOperation: OperationState
): Promise<void> {
  if (!currentOperation.token) {
    try {
      const neurodex = new NeuroDexApi();
      const tokenData = await neurodex.getTokenDataByContractAddress(userInput, 'base');

      ctx.session.currentOperation = {
        type: 'dca',
        token: userInput,
        tokenSymbol: tokenData.data?.symbol,
        tokenName: tokenData.data?.name,
        tokenChain: tokenData.data?.chain,
      };

      const message = ctx.t('dca_token_found_msg', {
        tokenSymbol: tokenData.data?.symbol || '',
        tokenName: tokenData.data?.name || '',
        tokenPrice: tokenData.data?.price || 0,
        tokenChain: tokenData.data?.chain || '',
      });

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: dcaTokenKeyboard,
      });
    } catch (error) {
      await ctx.reply(ctx.t('token_not_found_msg'), {
        parse_mode: 'Markdown',
      });
    }
  } else if (!currentOperation.amount) {
    const parsedAmount = parseFloat(userInput);
    if (!isValidDcaAmount(parsedAmount)) {
      const message = await ctx.reply(ctx.t('invalid_amount_msg'));
      await deleteBotMessage(ctx, message.message_id);
      return;
    }

    ctx.session.currentOperation = {
      ...currentOperation,
      amount: parsedAmount,
    };

    await ctx.reply(ctx.t('dca_interval_msg'), {
      reply_markup: intervalKeyboard,
    });
  } else if (!currentOperation.interval) {
    // interval input
    const parsedInterval = parseInt(userInput);
    if (!isValidDcaInterval(parsedInterval)) {
      const message = await ctx.reply(ctx.t('dca_invalid_interval_msg'));
      await deleteBotMessage(ctx, message.message_id);
      return;
    }

    ctx.session.currentOperation = {
      ...currentOperation,
      interval: parsedInterval,
    };

    // send times message
    await ctx.reply(ctx.t('dca_times_msg'), {
      reply_markup: timesKeyboard,
      parse_mode: 'Markdown',
    });
  } else if (!currentOperation.times) {
    // times input
    const parsedTimes = parseInt(userInput);
    if (isNaN(parsedTimes) || parsedTimes < 1 || parsedTimes > 100) {
      const message = await ctx.reply(ctx.t('dca_invalid_times_msg'));
      await deleteBotMessage(ctx, message.message_id);
      return;
    }

    ctx.session.currentOperation = {
      ...currentOperation,
      times: parsedTimes,
    };

    // send confirmation message
    const message = ctx.t('dca_confirm_msg', {
      tokenSymbol: currentOperation.tokenSymbol || '',
      tokenName: currentOperation.tokenName || '',
      token: currentOperation.token,
      amount: currentOperation.amount,
      interval: currentOperation.interval,
      times: parsedTimes,
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: confirmDcaKeyboard,
    });
  }
}

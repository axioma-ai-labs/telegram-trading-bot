import { BotContext } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { buyTokenMessage } from '@/bot/commands/buy';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { BuyParams } from '@/types/neurodex';
import {
  error_message,
  invalid_amount_message,
  insufficient_funds_message,
  invalid_token_message,
  custom_amount_prompt,
  confirmBuyMessage,
  confirmBuyKeyboard,
} from '@/bot/commands/buy';
import { validateUserAndWallet } from '@/utils/userValidation';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import logger from '@/config/logger';

const transaction_success_message = (amount: number, token: string, txHash: string): string =>
  `✅ Buy order for ${amount} ETH on ${token} was successful!\n\n` +
  `Transaction details:\n` +
  `• Amount: ${amount} ETH\n` +
  `• Token: ${token}\n` +
  `• Transaction: https://basescan.org/tx/${txHash}`;

export async function buyToken(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  // buy
  ctx.session.currentOperation = {
    type: 'buy',
  };

  await ctx.reply(buyTokenMessage, {
    parse_mode: 'Markdown',
  });
}

export async function performBuy(ctx: BotContext, amount: string): Promise<void> {
  // validate user
  const { isValid } = await validateUserAndWallet(ctx);
  if (!isValid) return;
  const { currentOperation } = ctx.session;

  if (!currentOperation?.token) {
    const message = await ctx.reply(invalid_token_message);
    await deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // custom amount
  if (amount === 'custom') {
    await ctx.reply(custom_amount_prompt, {
      parse_mode: 'Markdown',
    });
    return;
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    const message = await ctx.reply(invalid_amount_message);
    await deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // Store the amount in the session for confirmation
  ctx.session.currentOperation = {
    ...currentOperation,
    amount: parsedAmount,
  };

  // Show confirmation dialog
  const confirmMessage = confirmBuyMessage(
    currentOperation.token,
    currentOperation.tokenSymbol || '',
    currentOperation.tokenName || '',
    parsedAmount
  );

  await ctx.reply(confirmMessage, {
    parse_mode: 'Markdown',
    reply_markup: confirmBuyKeyboard,
  });
}

export async function buyConfirm(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid || !user?.wallets?.[0]) return;
  const { currentOperation } = ctx.session;

  if (!currentOperation?.token || !currentOperation?.amount) {
    const message = await ctx.reply('❌ Invalid buy operation. Please try again.');
    await deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  const privateKey = await PrivateStorageService.getPrivateKey(user.wallets[0].address);
  if (!privateKey) {
    const message = await ctx.reply('❌ Private key not found. Please try again.');
    await deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  try {
    const params: BuyParams = {
      toTokenAddress: currentOperation.token,
      fromAmount: currentOperation.amount,
      slippage: Number(user?.settings?.slippage),
      gasPriority: 'standard',
      walletAddress: user.wallets[0].address,
      privateKey: privateKey,
      referrer: '0x8159F8156cD0F89114f72cD915b7b4BD7e83Ad4D',
    };

    const neurodex = new NeuroDexApi();
    const buyResult = await neurodex.buy(params, 'base');
    logger.info('BUY RESULT:', buyResult);

    // if success
    if (buyResult.success && buyResult.data?.txHash) {
      const message = transaction_success_message(
        currentOperation.amount,
        currentOperation.token,
        buyResult.data.txHash
      );
      await ctx.reply(message, {
        parse_mode: 'Markdown',
      });
      ctx.session.currentOperation = null;
    } else {
      // check if no mooooooooney
      const message = buyResult.error?.toLowerCase() || '';
      if (message.includes('insufficient funds')) {
        const message = await ctx.reply(insufficient_funds_message);
        await deleteBotMessage(ctx, message.message_id, 10000);
      } else {
        const message = await ctx.reply(error_message);
        await deleteBotMessage(ctx, message.message_id, 10000);
      }
      // reset
      ctx.session.currentOperation = null;
    }
  } catch (error) {
    logger.error('Error during buy transaction:', error);
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (message.includes('insufficient funds')) {
      const message = await ctx.reply(insufficient_funds_message);
      await deleteBotMessage(ctx, message.message_id, 10000);
    } else {
      const message = await ctx.reply(error_message);
      await deleteBotMessage(ctx, message.message_id, 10000);
    }
    // reset
    ctx.session.currentOperation = null;
  }
}

export async function buyCancel(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  // reset operation
  ctx.session.currentOperation = null;
  const message = await ctx.reply('✅ Buy order has been successfully cancelled!');
  await deleteBotMessage(ctx, message.message_id, 5000);
}

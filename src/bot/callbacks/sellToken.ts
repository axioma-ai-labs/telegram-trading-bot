import { BotContext } from '@/types/config';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { SellParams } from '@/types/neurodex';
import {
  sellTokenMessage,
  error_message,
  invalid_amount_message,
  insufficient_funds_message,
  invalid_token_message,
  custom_amount_prompt,
  confirmSellMessage,
  confirmSellKeyboard,
} from '@/bot/commands/sell';
import { validateUserAndWallet } from '@/utils/userValidation';

const transaction_success_message = (
  amount: number,
  token: string,
  tokenSymbol: string,
  txHash: string
): string =>
  `✅ Sell order for ${amount} ${tokenSymbol} was successful!\n\n` +
  `Transaction details:\n` +
  `• Amount: ${amount} ${tokenSymbol}\n` +
  `• Token: ${token}\n` +
  `• Transaction: https://basescan.org/tx/${txHash}`;

export async function sellToken(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  // sell
  ctx.session.currentOperation = {
    type: 'sell',
  };

  await ctx.reply(sellTokenMessage, {
    parse_mode: 'Markdown',
  });
}

export async function performSell(ctx: BotContext, amount: string): Promise<void> {
  // validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid || !user?.wallets?.[0]) return;
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

  try {
    const neurodex = new NeuroDexApi();

    // Get user's token balance using Covalent API
    const balancesResponse = await neurodex.getTokenBalances(
      'base-mainnet',
      user.wallets[0].address
    );

    if (!balancesResponse || !balancesResponse.items) {
      const message = await ctx.reply('❌ Failed to fetch wallet balance. Please try again.');
      await deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    // Find the token in balances
    const tokenBalance = balancesResponse.items.find(
      (tokenItem) =>
        tokenItem?.contract_address?.toLowerCase() === currentOperation.token!.toLowerCase()
    );

    if (!tokenBalance || !tokenBalance.balance || tokenBalance.balance === 0n) {
      const message = await ctx.reply('❌ You have no balance of this token to sell.');
      await deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    // Convert balance from bigint to number (considering decimals)
    const decimals = tokenBalance.contract_decimals || 18;
    const balanceNumber = parseFloat(tokenBalance.balance.toString()) / Math.pow(10, decimals);

    let sellAmount: number;

    // Handle percentage amounts
    if (amount.endsWith('%')) {
      const percentage = parseInt(amount.replace('%', ''));
      if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
        const message = await ctx.reply(invalid_amount_message);
        await deleteBotMessage(ctx, message.message_id, 10000);
        return;
      }
      sellAmount = (balanceNumber * percentage) / 100;
    } else {
      // Handle custom numeric amount
      sellAmount = parseFloat(amount);
      if (isNaN(sellAmount) || sellAmount <= 0) {
        const message = await ctx.reply(invalid_amount_message);
        await deleteBotMessage(ctx, message.message_id, 10000);
        return;
      }

      // Check if user has enough balance
      if (sellAmount > balanceNumber) {
        const message = await ctx.reply(
          `❌ Insufficient balance. You only have ${balanceNumber.toFixed(6)} ${tokenBalance.contract_ticker_symbol || 'tokens'}.`
        );
        await deleteBotMessage(ctx, message.message_id, 10000);
        return;
      }
    }

    // Store the amount in the session for confirmation
    ctx.session.currentOperation = {
      ...currentOperation,
      amount: sellAmount,
    };

    // Show confirmation dialog
    const confirmMessage = confirmSellMessage(
      currentOperation.token,
      currentOperation.tokenSymbol || tokenBalance.contract_ticker_symbol || '',
      currentOperation.tokenName || tokenBalance.contract_name || 'Unknown',
      sellAmount
    );

    await ctx.reply(confirmMessage, {
      parse_mode: 'Markdown',
      reply_markup: confirmSellKeyboard,
    });
  } catch (error) {
    console.error('Error during sell preparation:', error);
    const message = await ctx.reply(error_message);
    await deleteBotMessage(ctx, message.message_id, 10000);
  }
}

export async function sellConfirm(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid || !user?.wallets?.[0]) return;

  const { currentOperation } = ctx.session;

  if (!currentOperation?.token || !currentOperation?.amount) {
    const message = await ctx.reply('❌ Invalid sell operation. Please try again.');
    await deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  try {
    const params: SellParams = {
      fromTokenAddress: currentOperation.token,
      fromAmount: currentOperation.amount,
      slippage: Number(user?.settings?.slippage),
      gasPriority: 'standard',
      walletAddress: user.wallets[0].address,
      privateKey: user.wallets[0].encryptedPrivateKey || '',
      referrer: '0x8159F8156cD0F89114f72cD915b7b4BD7e83Ad4D',
    };

    const neurodex = new NeuroDexApi();
    const sellResult = await neurodex.sell(params, 'base');
    console.log('SELL RESULT:', sellResult);

    // if success
    if (sellResult.success && sellResult.data?.txHash) {
      const message = transaction_success_message(
        currentOperation.amount,
        currentOperation.token,
        currentOperation.tokenSymbol || 'tokens',
        sellResult.data.txHash
      );
      await ctx.reply(message, {
        parse_mode: 'Markdown',
      });
      ctx.session.currentOperation = null;
    } else {
      // check if no balance or other errors
      const message = sellResult.error?.toLowerCase() || '';
      if (message.includes('insufficient') || message.includes('balance')) {
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
    console.error('Error during sell transaction:', error);
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (message.includes('insufficient') || message.includes('balance')) {
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

export async function sellCancel(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  // reset operation
  ctx.session.currentOperation = null;
  const message = await ctx.reply('✅ Sell order has been successfully cancelled!');
  await deleteBotMessage(ctx, message.message_id, 5000);
}

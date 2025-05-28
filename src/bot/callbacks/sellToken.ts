import { confirmSellKeyboard } from '@/bot/commands/sell';
import logger from '@/config/logger';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import { GasPriority } from '@/types/config';
import { SellParams } from '@/types/neurodex';
import { BotContext } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { validateUser } from '@/utils/userValidation';

export async function sellToken(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;

  // sell
  ctx.session.currentOperation = {
    type: 'sell',
  };

  await ctx.reply(ctx.t('sell_token_msg'), {
    parse_mode: 'Markdown',
  });
}

export async function performSell(ctx: BotContext, amount: string): Promise<void> {
  // validate user
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.wallets?.[0]) return;
  const { currentOperation } = ctx.session;

  if (!currentOperation?.token) {
    const message = await ctx.reply(ctx.t('invalid_token_msg'));
    await deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // custom amount
  if (amount === 'custom') {
    await ctx.reply(ctx.t('sell_custom_amount_msg'), {
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
      const message = await ctx.reply(ctx.t('error_msg'));
      await deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    // Find the token in balances
    const tokenBalance = balancesResponse.items.find(
      (tokenItem) =>
        tokenItem?.contract_address?.toLowerCase() === currentOperation.token!.toLowerCase()
    );

    if (!tokenBalance || !tokenBalance.balance || tokenBalance.balance === 0n) {
      const message = await ctx.reply(ctx.t('sell_no_balance_msg'));
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
        const message = await ctx.reply(ctx.t('invalid_amount_msg'));
        await deleteBotMessage(ctx, message.message_id, 10000);
        return;
      }
      sellAmount = (balanceNumber * percentage) / 100;
    } else {
      // Handle custom numeric amount
      sellAmount = parseFloat(amount);
      if (isNaN(sellAmount) || sellAmount <= 0) {
        const message = await ctx.reply(ctx.t('invalid_amount_msg'));
        await deleteBotMessage(ctx, message.message_id, 10000);
        return;
      }

      // Check if user has enough balance
      if (sellAmount > balanceNumber) {
        const message = await ctx.reply(
          ctx.t('sell_insufficient_balance_msg', {
            balance: balanceNumber.toFixed(6),
            tokenSymbol: tokenBalance.contract_ticker_symbol || 'tokens',
          })
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
    const confirmMessage = ctx.t('sell_confirm_msg', {
      token: currentOperation.token,
      tokenSymbol: currentOperation.tokenSymbol || tokenBalance.contract_ticker_symbol || '',
      tokenName: currentOperation.tokenName || tokenBalance.contract_name || 'Unknown',
      amount: sellAmount,
    });

    await ctx.reply(confirmMessage, {
      parse_mode: 'Markdown',
      reply_markup: confirmSellKeyboard,
    });
  } catch (error) {
    logger.error('Error during sell preparation:', error);
    const message = await ctx.reply(ctx.t('error_msg'));
    await deleteBotMessage(ctx, message.message_id, 10000);
  }
}

export async function sellConfirm(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.wallets?.[0]) return;

  const { currentOperation } = ctx.session;

  if (!currentOperation?.token || !currentOperation?.amount) {
    const message = await ctx.reply(ctx.t('sell_invalid_operation_msg'));
    await deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  const privateKey = await PrivateStorageService.getPrivateKey(user.wallets[0].address);
  if (!privateKey) {
    const message = await ctx.reply(ctx.t('no_private_key_msg'));
    await deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  try {
    const params: SellParams = {
      fromTokenAddress: currentOperation.token,
      fromAmount: currentOperation.amount,
      slippage: Number(user?.settings?.slippage),
      gasPriority: user?.settings?.gasPriority as GasPriority,
      walletAddress: user.wallets[0].address,
      privateKey: privateKey,
      referrer: '0x8159F8156cD0F89114f72cD915b7b4BD7e83Ad4D',
    };

    const neurodex = new NeuroDexApi();
    const sellResult = await neurodex.sell(params, 'base');
    logger.info('SELL RESULT:', sellResult);

    // if success
    if (sellResult.success && sellResult.data?.txHash) {
      const message = ctx.t('sell_success_msg', {
        amount: currentOperation.amount,
        tokenSymbol: currentOperation.tokenSymbol || 'tokens',
        token: currentOperation.token,
        txHash: sellResult.data.txHash,
      });

      await ctx.reply(message, {
        parse_mode: 'Markdown',
      });
      ctx.session.currentOperation = null;
    } else {
      // check if no balance or other errors
      const errorMessage = sellResult.error?.toLowerCase() || '';
      if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
        const message = await ctx.reply(ctx.t('insufficient_funds_msg'));
        await deleteBotMessage(ctx, message.message_id, 10000);
      } else {
        const message = await ctx.reply(ctx.t('error_msg'));
        await deleteBotMessage(ctx, message.message_id, 10000);
      }
      // reset
      ctx.session.currentOperation = null;
    }
  } catch (error) {
    logger.error('Error during sell transaction:', error);
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
    if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
      const message = await ctx.reply(ctx.t('insufficient_funds_msg'));
      await deleteBotMessage(ctx, message.message_id, 10000);
    } else {
      const message = await ctx.reply(ctx.t('error_msg'));
      await deleteBotMessage(ctx, message.message_id, 10000);
    }
    // reset
    ctx.session.currentOperation = null;
  }
}

export async function sellCancel(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;

  // reset operation
  ctx.session.currentOperation = null;
  const message = await ctx.reply(ctx.t('sell_cancel_msg'));
  await deleteBotMessage(ctx, message.message_id, 5000);
}

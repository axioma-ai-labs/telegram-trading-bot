import { TransactionStatus } from '@prisma/client/edge';

import { confirmSellKeyboard } from '@/bot/commands/sell';
import logger from '@/config/logger';
import { CoinStatsService } from '@/services/engine/coinstats';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { TransactionsService } from '@/services/prisma/transactions';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import { CoinStatsBalance } from '@/types/coinstats';
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
    deleteBotMessage(ctx, message.message_id, 10000);
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
    const coinStatsService = CoinStatsService.getInstance();

    const balancesResponse = await coinStatsService.getWalletBalances(user.wallets[0].address);

    if (!balancesResponse || !balancesResponse.length) {
      const message = await ctx.reply(ctx.t('error_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    // Find the token in balances across all blockchains
    const tokenBalance = balancesResponse
      .flatMap((blockchain) => blockchain.balances)
      .find(
        (tokenItem: CoinStatsBalance) =>
          tokenItem?.contractAddress?.toLowerCase() === currentOperation.token!.toLowerCase()
      );

    if (!tokenBalance || !tokenBalance.amount || tokenBalance.amount === 0) {
      const message = await ctx.reply(ctx.t('sell_no_balance_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
      return;
    }

    // Convert balance from number (CoinStats already provides amount in decimal form)
    const balanceNumber = tokenBalance.amount;

    let sellAmount: number;

    // Handle percentage amounts
    if (amount.endsWith('%')) {
      const percentage = parseInt(amount.replace('%', ''));
      if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
        const message = await ctx.reply(ctx.t('invalid_amount_msg'));
        deleteBotMessage(ctx, message.message_id, 10000);
        return;
      }
      sellAmount = (balanceNumber * percentage) / 100;
    } else {
      // Handle custom numeric amount
      sellAmount = parseFloat(amount);
      if (isNaN(sellAmount) || sellAmount <= 0) {
        const message = await ctx.reply(ctx.t('invalid_amount_msg'));
        deleteBotMessage(ctx, message.message_id, 10000);
        return;
      }

      // Check if user has enough balance
      if (sellAmount > balanceNumber) {
        const message = await ctx.reply(
          ctx.t('sell_insufficient_balance_msg', {
            balance: balanceNumber.toFixed(6),
            tokenSymbol: tokenBalance.symbol || 'tokens',
          })
        );
        deleteBotMessage(ctx, message.message_id, 10000);
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
      tokenSymbol: currentOperation.tokenSymbol || tokenBalance.symbol || '',
      tokenName: currentOperation.tokenName || tokenBalance.name || 'Unknown',
      amount: sellAmount,
    });

    await ctx.reply(confirmMessage, {
      parse_mode: 'Markdown',
      reply_markup: confirmSellKeyboard,
    });
  } catch (error) {
    logger.error('Error during sell preparation:', error);
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
  }
}

export async function sellConfirm(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.wallets?.[0]) return;

  const { currentOperation } = ctx.session;

  if (!currentOperation?.token || !currentOperation?.amount) {
    const message = await ctx.reply(ctx.t('sell_invalid_operation_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  const privateKey = await PrivateStorageService.getPrivateKey(user.wallets[0].address);
  if (!privateKey) {
    const message = await ctx.reply(ctx.t('no_private_key_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  // Create pending transaction record
  let transaction;
  try {
    transaction = await TransactionsService.createSellTransaction(user.id, user.wallets[0].id, {
      chain: 'base',
      tokenInAddress: currentOperation.token,
      tokenInSymbol: currentOperation.tokenSymbol || 'TOKEN',
      tokenInAmount: currentOperation.amount,
      tokenOutAddress: '0x4200000000000000000000000000000000000006', // WETH on Base
      tokenOutSymbol: 'ETH',
      status: TransactionStatus.PENDING,
    });
    logger.info('Created pending sell transaction:', transaction.id);
  } catch (error) {
    logger.error('Error creating transaction record:', error);
    const message = await ctx.reply(ctx.t('error_msg'));
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
      // Update transaction with success status and txHash
      await TransactionsService.updateTransactionStatus(
        transaction.id,
        TransactionStatus.COMPLETED,
        sellResult.data.txHash
      );

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
      // Update transaction with failed status
      await TransactionsService.updateTransactionStatus(transaction.id, TransactionStatus.FAILED);

      // check if no balance or other errors
      const errorMessage = sellResult.error?.toLowerCase() || '';
      if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
        const message = await ctx.reply(ctx.t('insufficient_funds_msg'));
        deleteBotMessage(ctx, message.message_id, 10000);
      } else {
        const message = await ctx.reply(ctx.t('error_msg'));
        deleteBotMessage(ctx, message.message_id, 10000);
      }
      // reset
      ctx.session.currentOperation = null;
    }
  } catch (error) {
    // Update transaction with failed status
    await TransactionsService.updateTransactionStatus(transaction.id, TransactionStatus.FAILED);

    logger.error('Error during sell transaction:', error);
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
    if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
      const message = await ctx.reply(ctx.t('insufficient_funds_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
    } else {
      const message = await ctx.reply(ctx.t('error_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
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
  deleteBotMessage(ctx, message.message_id, 5000);
}

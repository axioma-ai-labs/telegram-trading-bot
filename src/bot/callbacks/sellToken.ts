import { TransactionStatus } from '@prisma/client/edge';

import { confirmSellKeyboard } from '@/bot/commands/sell';
import { startKeyboard } from '@/bot/commands/start';
import logger from '@/config/logger';
import { CoinStatsService } from '@/services/engine/coinstats';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { ViemService } from '@/services/engine/viem';
import { TransactionsService } from '@/services/prisma/transactions';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import { CoinStatsBalance } from '@/types/coinstats';
import { GasPriority } from '@/types/config';
import { SellParams } from '@/types/neurodex';
import { BotContext } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { calculateSellAmount, calculateTokenUsdValue } from '@/utils/formatters';
import { validateUser } from '@/utils/userValidation';

export async function sellToken(ctx: BotContext): Promise<void> {
  // validate user
  const user = await validateUser(ctx);

  // sell
  ctx.session.currentOperation = {
    type: 'sell',
  };

  // Get wallet data
  const walletAddress = user.wallets[0].address as `0x${string}`;

  // Get ETH balance
  const viemService = new ViemService();
  const ethBalance = (await viemService.getNativeBalance(walletAddress)) || '0.000';

  // Get formatted sell balances
  const coinStatsService = CoinStatsService.getInstance();
  const formattedSellBalances = await coinStatsService.getFormattedSellBalances(
    walletAddress,
    'base'
  );

  await ctx.reply(
    ctx.t('sell_token_msg', {
      ethBalance,
      formattedSellBalances,
    }),
    {
      parse_mode: 'Markdown',
    }
  );
}

export async function performSell(ctx: BotContext, amount: string): Promise<void> {
  // validate user
  const user = await validateUser(ctx);
  const { currentOperation } = ctx.session;

  if (!currentOperation?.token) {
    const message = await ctx.reply(ctx.t('invalid_token_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // Handle custom amount request
  if (amount === 'custom') {
    await ctx.reply(ctx.t('sell_custom_amount_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  }

  const coinStatsService = CoinStatsService.getInstance();
  const balances = await coinStatsService.getWalletBalances(user.wallets[0].address);

  if (!balances || !balances.length) {
    const message = await ctx.reply(ctx.t('error_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // Find the token in balances across all blockchains
  const tokenBalance = balances
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

  const balanceNumber = Number(tokenBalance.amount);
  const tokenSymbol = tokenBalance.symbol || 'tokens';

  // Debug logging
  logger.info(
    `[SELL DEBUG] Processing sell amount: "${amount}" for ${balanceNumber} ${tokenSymbol}`
  );

  // Use the new formatter to calculate sell amount
  const amountResult = calculateSellAmount(amount, balanceNumber, tokenSymbol);

  // Debug logging
  logger.info(`[SELL DEBUG] Amount calculation result:`, {
    success: amountResult.success,
    sellAmount: amountResult.sellAmount,
    error: amountResult.error,
    isCustomAmountRequest: amountResult.isCustomAmountRequest,
  });

  if (!amountResult.success) {
    const message = await ctx.reply(amountResult.error || ctx.t('invalid_amount_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  if (amountResult.isCustomAmountRequest) {
    await ctx.reply(ctx.t('sell_custom_amount_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  }

  const sellAmount = amountResult.sellAmount!;

  // Calculate USD value using the new formatter
  const usdValue = await calculateTokenUsdValue(currentOperation.token, sellAmount, 'base');

  // set amount
  ctx.session.currentOperation = {
    ...currentOperation,
    amount: sellAmount,
  };

  // Show confirmation dialog with properly formatted amounts
  const confirmMessage = await ctx.reply(
    ctx.t('sell_confirm_msg', {
      tokenAddress: currentOperation.token,
      tokenSymbol: currentOperation.tokenSymbol || tokenSymbol,
      tokenName: currentOperation.tokenName || 'Unknown Token',
      amount: sellAmount.toFixed(3),
      usdValue: usdValue,
    }),
    {
      parse_mode: 'Markdown',
      reply_markup: confirmSellKeyboard,
    }
  );

  // set current message for deletion
  ctx.session.currentMessage = {
    messageId: confirmMessage.message_id,
    chatId: confirmMessage.chat.id,
    type: 'confirmation',
  };
}

export async function sellConfirm(ctx: BotContext): Promise<void> {
  // validate user
  const user = await validateUser(ctx);

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
  const transaction = await TransactionsService.createSellTransaction(user.id, user.wallets[0].id, {
    chain: 'base',
    tokenInAddress: currentOperation.token,
    tokenInSymbol: currentOperation.tokenSymbol || '',
    tokenInAmount: currentOperation.amount,
    tokenOutAddress: '0x4200000000000000000000000000000000000006', // WETH on Base
    tokenOutSymbol: 'ETH',
    status: TransactionStatus.PENDING,
  });
  logger.info('Created pending sell transaction:', transaction.id);

  const params: SellParams = {
    fromTokenAddress: currentOperation.token,
    fromAmount: currentOperation.amount,
    slippage: Number(user?.settings?.slippage) || 1,
    gasPriority: (user?.settings?.gasPriority as GasPriority) || 'standard',
    walletAddress: user.wallets[0].address,
    privateKey: privateKey,
    referrer: '0x8159F8156cD0F89114f72cD915b7b4BD7e83Ad4D',
  };

  const neurodex = new NeuroDexApi();
  const sellResult = await neurodex.sell(params, 'base');
  logger.info('SELL RESULT:', sellResult);

  // if success
  if (sellResult.success && sellResult.data?.txHash) {
    // Delete confirmation message
    if (ctx.session.currentMessage?.messageId && ctx.session.currentMessage?.chatId) {
      await ctx.api.deleteMessage(
        ctx.session.currentMessage.chatId,
        ctx.session.currentMessage.messageId
      );
    }

    // Update transaction with success status and txHash
    await TransactionsService.updateTransactionStatus(
      transaction.id,
      TransactionStatus.COMPLETED,
      sellResult.data.txHash
    );

    const message = ctx.t('sell_success_msg', {
      amount: currentOperation.amount.toFixed(3),
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

    // edit confirmation message
    if (ctx.session.currentMessage?.messageId && ctx.session.currentMessage?.chatId) {
      await ctx.api.editMessageText(
        ctx.session.currentMessage?.chatId,
        ctx.session.currentMessage?.messageId,
        ctx.t('sell_error_msg')
      );
    }
    // reset
    ctx.session.currentOperation = null;
  }
}

export async function sellCancel(ctx: BotContext): Promise<void> {
  // validate user
  await validateUser(ctx);

  // Delete confirmation message
  if (ctx.session.currentMessage?.messageId && ctx.session.currentMessage?.chatId) {
    await ctx.api.deleteMessage(
      ctx.session.currentMessage.chatId,
      ctx.session.currentMessage.messageId
    );
  }

  // reset operation
  ctx.session.currentOperation = null;

  // Send cancel message
  const cancelMessage = await ctx.reply(ctx.t('sell_cancel_msg'));
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await ctx.api.deleteMessage(cancelMessage.chat.id, cancelMessage.message_id);

  // Send start message
  await ctx.reply(ctx.t('start_msg'), {
    parse_mode: 'Markdown',
    reply_markup: startKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

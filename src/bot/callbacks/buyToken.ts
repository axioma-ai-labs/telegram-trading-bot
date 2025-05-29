import { TransactionStatus } from '@prisma/client/edge';

import { confirmBuyKeyboard } from '@/bot/commands/buy';
import logger from '@/config/logger';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { TransactionsService } from '@/services/prisma/transactions';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import { GasPriority } from '@/types/config';
import { BuyParams } from '@/types/neurodex';
import { BotContext } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { validateUser } from '@/utils/userValidation';

export async function buyToken(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;

  // buy
  ctx.session.currentOperation = {
    type: 'buy',
  };

  await ctx.reply(ctx.t('buy_token_msg'), {
    parse_mode: 'Markdown',
  });
}

export async function performBuy(ctx: BotContext, amount: string): Promise<void> {
  // validate user
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;
  const { currentOperation } = ctx.session;

  if (!currentOperation?.token) {
    const message = await ctx.reply(ctx.t('invalid_token_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // custom amount
  if (amount === 'custom') {
    await ctx.reply(ctx.t('buy_amount_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    const message = await ctx.reply(ctx.t('invalid_amount_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // store amount in session for confirmation
  ctx.session.currentOperation = {
    ...currentOperation,
    amount: parsedAmount,
  };

  // confirmation
  const confirmMessage = await ctx.reply(
    ctx.t('buy_confirm_msg', {
      token: currentOperation.token,
      tokenSymbol: currentOperation.tokenSymbol || '',
      tokenName: currentOperation.tokenName || '',
      amount: parsedAmount,
    }),
    {
      parse_mode: 'Markdown',
      reply_markup: confirmBuyKeyboard,
    }
  );

  // set current message for deletion
  ctx.session.currentMessage = {
    messageId: confirmMessage.message_id,
    chatId: confirmMessage.chat.id,
    type: 'confirmation',
  };
}

export async function buyConfirm(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.wallets?.[0]) return;
  const { currentOperation } = ctx.session;

  if (!currentOperation?.token || !currentOperation?.amount) {
    const message = await ctx.reply(ctx.t('buy_error_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  const privateKey = await PrivateStorageService.getPrivateKey(user.wallets[0].address);
  if (!privateKey) {
    const message = await ctx.reply(ctx.t('no_private_key_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  const params: BuyParams = {
    toTokenAddress: currentOperation.token,
    fromAmount: currentOperation.amount,
    slippage: Number(user?.settings?.slippage),
    gasPriority: user?.settings?.gasPriority as GasPriority,
    walletAddress: user.wallets[0].address,
    privateKey: privateKey,
    referrer: '0x8159F8156cD0F89114f72cD915b7b4BD7e83Ad4D',
  };

  // Create pending transaction record
  let transaction;
  try {
    transaction = await TransactionsService.createBuyTransaction(user.id, user.wallets[0].id, {
      chain: 'base',
      tokenInAddress: '0x4200000000000000000000000000000000000006', // WETH on Base
      tokenInSymbol: 'ETH',
      tokenInAmount: currentOperation.amount,
      tokenOutAddress: currentOperation.token,
      tokenOutSymbol: currentOperation.tokenSymbol || 'TOKEN',
      status: TransactionStatus.PENDING,
    });
    logger.info('Created pending buy transaction:', transaction.id);
  } catch (error) {
    logger.error('Error creating transaction record:', error);
    const message = await ctx.reply(ctx.t('buy_error_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  const neurodex = new NeuroDexApi();
  const buyResult = await neurodex.buy(params, 'base');
  logger.info('BUY RESULT:', buyResult);

  // if success
  if (buyResult.success && buyResult.data?.txHash) {
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
      buyResult.data.txHash
    );
    const message = ctx.t('buy_success_msg', {
      amount: currentOperation.amount,
      token: currentOperation.token,
      txHash: buyResult.data.txHash,
    });
    await ctx.reply(message, {
      parse_mode: 'Markdown',
    });
    ctx.session.currentOperation = null;
  } else {
    // Update transaction with failed status
    await TransactionsService.updateTransactionStatus(transaction.id, TransactionStatus.FAILED);

    // check if no mooooooooney
    const message = buyResult.error?.toLowerCase() || '';
    if (message.includes('insufficient funds')) {
      const message = await ctx.reply(ctx.t('insufficient_funds_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
    } else {
      const message = await ctx.reply(ctx.t('buy_error_msg'));
      deleteBotMessage(ctx, message.message_id, 10000);
    }
    // reset
    ctx.session.currentOperation = null;
  }
}

export async function buyCancel(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;

  // Delete confirmation message
  if (ctx.session.currentMessage?.messageId && ctx.session.currentMessage?.chatId) {
    await ctx.api.deleteMessage(
      ctx.session.currentMessage.chatId,
      ctx.session.currentMessage.messageId
    );
  }

  // reset operation
  ctx.session.currentOperation = null;
  const message = await ctx.reply(ctx.t('buy_cancel_msg'));
  deleteBotMessage(ctx, message.message_id, 5000);
}

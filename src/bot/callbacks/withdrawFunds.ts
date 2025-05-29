import { TransactionStatus } from '@prisma/client/edge';

import { confirmWithdrawKeyboard, withdrawAmountKeyboard } from '@/bot/commands/withdraw';
import logger from '@/config/logger';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { ViemService } from '@/services/engine/viem';
import { TransactionsService } from '@/services/prisma/transactions';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import { GasPriority } from '@/types/config';
import { WithdrawParams } from '@/types/neurodex';
import { BotContext } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { validateUser } from '@/utils/userValidation';

export async function withdrawFunds(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user) return;

  // Set current operation
  ctx.session.currentOperation = { type: 'withdraw' };

  const viemService = new ViemService();
  const ethBalance = await viemService.getNativeBalance(user.wallets[0].address as `0x${string}`);

  const message = ctx.t('withdraw_select_amount_msg', {
    ethBalance: ethBalance || '0.000',
  });

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: withdrawAmountKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

export async function performWithdraw(ctx: BotContext, amount: string): Promise<void> {
  // validate user
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.wallets?.[0]) return;
  const { currentOperation } = ctx.session;

  if (!currentOperation || currentOperation.type !== 'withdraw') {
    const invalidOpMessage = await ctx.reply(ctx.t('withdraw_invalid_operation_msg'));
    deleteBotMessage(ctx, invalidOpMessage.message_id, 10000);
    return;
  }

  // custom amount
  if (amount === 'custom') {
    await ctx.reply(ctx.t('withdraw_custom_amount_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    const invalidAmountMessage = await ctx.reply(ctx.t('invalid_amount_msg'));
    deleteBotMessage(ctx, invalidAmountMessage.message_id, 10000);
    return;
  }

  // Check if user has sufficient balance
  const viemService = new ViemService();
  const ethBalance = await viemService.getNativeBalance(user.wallets[0].address as `0x${string}`);
  const balanceNumber = parseFloat(ethBalance);

  if (parsedAmount > balanceNumber) {
    const insufficientBalanceMessage = await ctx.reply(
      ctx.t('withdraw_insufficient_balance_msg', {
        balance: ethBalance,
        amount: parsedAmount,
      })
    );
    deleteBotMessage(ctx, insufficientBalanceMessage.message_id, 10000);
    return;
  }

  // Ask for recipient address if not provided
  if (!currentOperation.recipientAddress) {
    ctx.session.currentOperation = {
      ...currentOperation,
      amount: parsedAmount,
    };

    await ctx.reply(ctx.t('withdraw_recipient_address_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  }

  // Store amount and show confirmation
  ctx.session.currentOperation = {
    ...currentOperation,
    amount: parsedAmount,
  };

  const confirmMessage = await ctx.reply(
    ctx.t('withdraw_confirm_msg', {
      amount: parsedAmount,
      recipientAddress: currentOperation.recipientAddress,
    }),
    {
      parse_mode: 'Markdown',
      reply_markup: confirmWithdrawKeyboard,
    }
  );

  // set current message for deletion
  ctx.session.currentMessage = {
    messageId: confirmMessage.message_id,
    chatId: confirmMessage.chat.id,
    type: 'confirmation',
  };
}

export async function setRecipientAddress(ctx: BotContext, address: string): Promise<void> {
  // validate user
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;
  const { currentOperation } = ctx.session;

  if (!currentOperation || currentOperation.type !== 'withdraw') {
    const invalidOpMessage = await ctx.reply(ctx.t('withdraw_invalid_operation_msg'));
    deleteBotMessage(ctx, invalidOpMessage.message_id, 10000);
    return;
  }

  // Basic address validation (starts with 0x and has correct length)
  if (!address.startsWith('0x') || address.length !== 42) {
    const invalidAddressMessage = await ctx.reply(ctx.t('invalid_address_msg'));
    deleteBotMessage(ctx, invalidAddressMessage.message_id, 10000);
    return;
  }

  // Store recipient address
  ctx.session.currentOperation = {
    ...currentOperation,
    recipientAddress: address,
  };

  // If amount is already set, show confirmation
  if (currentOperation.amount) {
    const message = ctx.t('withdraw_confirm_msg', {
      amount: currentOperation.amount,
      recipientAddress: address,
    });

    const confirmMessage = await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: confirmWithdrawKeyboard,
    });

    // set current message for deletion
    ctx.session.currentMessage = {
      messageId: confirmMessage.message_id,
      chatId: confirmMessage.chat.id,
      type: 'confirmation',
    };
  } else {
    // Ask for amount
    await ctx.reply(ctx.t('withdraw_custom_amount_msg'), {
      parse_mode: 'Markdown',
    });
  }
}

export async function withdrawConfirm(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user?.wallets?.[0]) return;
  const { currentOperation } = ctx.session;

  if (
    !currentOperation?.amount ||
    !currentOperation?.recipientAddress ||
    currentOperation.type !== 'withdraw'
  ) {
    const invalidOpMessage = await ctx.reply(ctx.t('withdraw_invalid_operation_msg'));
    deleteBotMessage(ctx, invalidOpMessage.message_id, 5000);
    return;
  }

  const privateKey = await PrivateStorageService.getPrivateKey(user.wallets[0].address);
  if (!privateKey) {
    const noPrivateKeyMessage = await ctx.reply(ctx.t('no_private_key_msg'));
    deleteBotMessage(ctx, noPrivateKeyMessage.message_id, 5000);
    return;
  }

  // Create pending transaction record
  let transaction;
  try {
    transaction = await TransactionsService.createWithdrawTransaction(user.id, user.wallets[0].id, {
      chain: 'base',
      tokenInAddress: '0x4200000000000000000000000000000000000006', // WETH on Base
      tokenInSymbol: 'ETH',
      tokenInAmount: currentOperation.amount,
      toAddress: currentOperation.recipientAddress,
      status: TransactionStatus.PENDING,
    });
    logger.info('Created pending withdraw transaction:', transaction.id);
  } catch (error) {
    logger.error('Error creating transaction record:', error);
    const message = await ctx.reply(ctx.t('withdraw_error_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  try {
    const params: WithdrawParams = {
      toAddress: currentOperation.recipientAddress,
      amount: currentOperation.amount,
      slippage: Number(user?.settings?.slippage), // Not used for withdrawal but required by interface
      gasPriority: user?.settings?.gasPriority as GasPriority,
      walletAddress: user.wallets[0].address,
      privateKey: privateKey,
      referrer: '0x8159F8156cD0F89114f72cD915b7b4BD7e83Ad4D',
    };

    const neurodex = new NeuroDexApi();
    const withdrawResult = await neurodex.withdraw(params, 'base');
    logger.info('WITHDRAW RESULT:', withdrawResult);

    // if success
    if (withdrawResult.success && withdrawResult.data?.txHash) {
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
        withdrawResult.data.txHash
      );

      const successMessage = ctx.t('withdraw_success_msg', {
        walletAddress: user.wallets[0].address,
        amount: currentOperation.amount,
        recipientAddress: currentOperation.recipientAddress,
        txHash: withdrawResult.data.txHash,
      });

      await ctx.reply(successMessage, {
        parse_mode: 'Markdown',
      });

      // Reset session state
      ctx.session.currentOperation = null;
      ctx.session.currentMessage = null;
    } else {
      // Update transaction with failed status
      await TransactionsService.updateTransactionStatus(transaction.id, TransactionStatus.FAILED);

      // check if insufficient funds or other errors
      const errorMessage = withdrawResult.error?.toLowerCase() || '';
      if (errorMessage.includes('insufficient funds') || errorMessage.includes('balance')) {
        const insufficientFundsMessage = await ctx.reply(ctx.t('insufficient_funds_msg'));
        deleteBotMessage(ctx, insufficientFundsMessage.message_id, 10000);
      }
      // reset
      ctx.session.currentOperation = null;
    }
  } catch (error) {
    // Update transaction with failed status
    await TransactionsService.updateTransactionStatus(transaction.id, TransactionStatus.FAILED);

    logger.error('Error during withdraw transaction:', error);
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
    if (errorMessage.includes('insufficient funds') || errorMessage.includes('balance')) {
      const insufficientFundsMessage = await ctx.reply(ctx.t('insufficient_funds_msg'));
      deleteBotMessage(ctx, insufficientFundsMessage.message_id, 10000);
    } else {
      const withdrawErrorMessage = await ctx.reply(ctx.t('withdraw_error_msg'));
      deleteBotMessage(ctx, withdrawErrorMessage.message_id, 10000);
    }
    // reset
    ctx.session.currentOperation = null;
  }
}

export async function withdrawCancel(ctx: BotContext): Promise<void> {
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
  const cancelMessage = await ctx.reply(ctx.t('withdraw_cancel_msg'));
  deleteBotMessage(ctx, cancelMessage.message_id, 5000);
}

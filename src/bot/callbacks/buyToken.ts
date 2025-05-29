/**
 * @category Bot
 */
import { TransactionStatus } from '@prisma/client/edge';

import { confirmBuyKeyboard } from '@/bot/commands/buy';
import { startKeyboard } from '@/bot/commands/start';
import { config } from '@/config/config';
import logger from '@/config/logger';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { ViemService } from '@/services/engine/viem';
import { TransactionsService } from '@/services/prisma/transactions';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import { GasPriority } from '@/types/config';
import { BuyParams } from '@/types/neurodex';
import { BotContext } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { validateUser } from '@/utils/userValidation';
import { isValidAmount } from '@/utils/validators';

/**
 * Initiates the token buying process for a user.
 *
 * Sets up the buy operation in the user's session and prompts them to
 * paste a token contract address for the token they want to purchase.
 *
 * @param ctx - Telegram bot context containing user information and chat state
 * @throws Will return early if user validation fails
 *
 * @example
 * User clicks "Buy" button → Bot prompts for token address
 */
export async function buyToken(ctx: BotContext): Promise<void> {
  // validate user
  await validateUser(ctx);

  // buy
  ctx.session.currentOperation = { type: 'buy' };

  await ctx.reply(ctx.t('buy_token_msg'), {
    parse_mode: 'Markdown',
  });
}

/**
 * Processes the buy amount selection and prepares for transaction confirmation.
 *
 * Validates the amount, handles custom amount input, and stores the purchase
 * details in the session for confirmation. Shows a confirmation dialog with
 * transaction details before executing the buy order.
 *
 * @param ctx - Telegram bot context
 * @param amount - Amount to buy (as string) or 'custom' for user input
 * @throws Will show error message if token is not selected or amount is invalid
 *
 * @example
 * User selects "0.1 ETH" → Bot shows confirmation dialog
 * User selects "Custom" → Bot prompts for custom amount input
 */
export async function performBuy(ctx: BotContext, amount: string): Promise<void> {
  // validate user
  const user = await validateUser(ctx);
  const { currentOperation } = ctx.session;

  // custom amount
  if (amount === 'custom') {
    await ctx.reply(ctx.t('buy_amount_msg'), {
      parse_mode: 'Markdown',
    });
    return;
  }

  // validate amount
  if (!isValidAmount(amount)) {
    const message = await ctx.reply(ctx.t('invalid_amount_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  // parse amount after validation
  const parsedAmount = Number(amount);

  // get user eth balance
  const viemService = new ViemService();
  const ethBalance = await viemService.getNativeBalance(user.wallets[0].address as `0x${string}`);
  if (ethBalance < parsedAmount) {
    const message = await ctx.reply(ctx.t('insufficient_funds_msg'));
    deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  if (!currentOperation?.token) {
    const message = await ctx.reply(ctx.t('invalid_token_msg'));
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

/**
 * Executes the confirmed token purchase transaction.
 *
 * Performs the complete buy flow including:
 * 1. Validates user and operation parameters
 * 2. Retrieves user's private key from secure storage
 * 3. Creates a pending transaction record in database
 * 4. Executes the buy order via NeuroDex API
 * 5. Updates transaction status based on result
 * 6. Notifies user of success or failure
 *
 * Handles various error conditions including insufficient funds,
 * missing private keys, and transaction failures.
 *
 * @param ctx - Telegram bot context
 * @throws Will show error messages for various failure conditions
 * @throws Will return early if user validation or parameters are invalid
 *
 * @example
 * User confirms purchase → Transaction executes → Success/failure notification
 *
 * Success flow:
 * - Creates pending transaction record
 * - Executes buy via DEX aggregator
 * - Updates transaction as completed
 * - Shows success message with transaction hash
 *
 * Failure flow:
 * - Updates transaction as failed
 * - Shows appropriate error message
 * - Resets operation state
 */
export async function buyConfirm(ctx: BotContext): Promise<void> {
  // validate user
  const user = await validateUser(ctx);
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
    referrer: config.referrerWalletAddress,
  };

  // save to db
  const TransactionData = {
    chain: 'base',
    tokenInAddress: '0x4200000000000000000000000000000000000006', // WETH on Base
    tokenInSymbol: 'ETH',
    tokenInAmount: currentOperation.amount,
    tokenOutAddress: currentOperation.token,
    tokenOutSymbol: currentOperation.tokenSymbol || 'TOKEN',
    status: TransactionStatus.PENDING,
  };

  const transaction = await TransactionsService.createBuyTransaction(
    user.id,
    user.wallets[0].id,
    TransactionData
  );
  logger.info('Created pending buy transaction:', transaction.id);

  // buy
  const neurodex = new NeuroDexApi();
  const buyResult = await neurodex.buy(params, 'base');
  logger.info(`BUY RESULT: ${JSON.stringify(buyResult, null, 2)}`);

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
    // update db with failed status
    await TransactionsService.updateTransactionStatus(transaction.id, TransactionStatus.FAILED);

    // edit confirmation message
    if (ctx.session.currentMessage?.messageId && ctx.session.currentMessage?.chatId) {
      if (buyResult.error?.toLowerCase().includes('insufficient funds')) {
        await ctx.api.editMessageText(
          ctx.session.currentMessage?.chatId,
          ctx.session.currentMessage?.messageId,
          ctx.t('insufficient_funds_msg')
        );
      } else {
        await ctx.api.editMessageText(
          ctx.session.currentMessage?.chatId,
          ctx.session.currentMessage?.messageId,
          ctx.t('buy_error_msg')
        );
      }
    }

    // reset
    ctx.session.currentOperation = null;
  }
}

/**
 * Cancels the current buy operation and resets the user's session state.
 *
 * Cleans up the current operation from the user's session and shows
 * a cancellation confirmation message.
 *
 * @param ctx - Telegram bot context
 * @throws Will return early if user validation fails
 *
 * @example
 * User clicks "Cancel" button → Operation cancelled → Session reset
 */
export async function buyCancel(ctx: BotContext): Promise<void> {
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
  const cancelMessage = await ctx.reply(ctx.t('buy_cancel_msg'));
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await ctx.api.deleteMessage(cancelMessage.chat.id, cancelMessage.message_id);

  // send start message
  await ctx.reply(ctx.t('start_msg'), {
    parse_mode: 'Markdown',
    reply_markup: startKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

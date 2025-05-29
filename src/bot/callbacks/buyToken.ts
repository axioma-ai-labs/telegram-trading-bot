/**
 * @category Bot
 */
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
  const message = ctx.t('buy_confirm_msg', {
    token: currentOperation.token,
    tokenSymbol: currentOperation.tokenSymbol || '',
    tokenName: currentOperation.tokenName || '',
    amount: parsedAmount,
  });

  await ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: confirmBuyKeyboard,
  });
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
    await deleteBotMessage(ctx, message.message_id, 5000);
    return;
  }

  const neurodex = new NeuroDexApi();
  const buyResult = await neurodex.buy(params, 'base');
  logger.info('BUY RESULT:', buyResult);

  // if success
  if (buyResult.success && buyResult.data?.txHash) {
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
  const { isValid } = await validateUser(ctx);
  if (!isValid) return;

  // reset operation
  ctx.session.currentOperation = null;
  const message = await ctx.reply(ctx.t('buy_cancel_msg'));
  deleteBotMessage(ctx, message.message_id, 5000);
}

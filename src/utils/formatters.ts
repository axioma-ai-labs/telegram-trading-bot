/**
 * @category Utils
 */
import { Transaction, TransactionStatus, TransactionType } from '@prisma/client/edge';

import { DcaOrderInfo, LimitOrderInfo } from '@/types/neurodex';
import { BotContext } from '@/types/telegram';

/**
 * Converts time interval in seconds to human-readable format.
 *
 * Automatically selects the most appropriate time unit (seconds, hours, days, weeks, months)
 * based on the duration to provide the most readable representation.
 *
 * @param seconds - Time interval in seconds
 * @returns Human-readable time string
 *
 * @example
 * ```typescript
 * formatInterval(3600);    // "1 hours"
 * formatInterval(86400);   // "1 days"
 * formatInterval(604800);  // "1 weeks"
 * formatInterval(1800);    // "1800 seconds"
 * ```
 */
export const formatInterval = (seconds: number): string => {
  if (seconds < 3600) return `${seconds} seconds`;
  if (seconds < 86400) return `${seconds / 3600} hours`;
  if (seconds < 604800) return `${seconds / 86400} days`;
  if (seconds < 2592000) return `${seconds / 604800} weeks`;
  return `${seconds / 2592000} months`;
};

/**
 * Returns appropriate emoji for order status display in Telegram.
 *
 * Maps order status strings to corresponding emoji icons for visual
 * status indication in bot messages. Handles both text and numeric
 * status representations.
 *
 * @param status - Order status string or number
 * @returns Emoji character representing the status
 *
 * @example
 * ```typescript
 * getOrderStatusEmoji('active');    // "🟢"
 * getOrderStatusEmoji('filled');    // "✅"
 * getOrderStatusEmoji('cancelled'); // "❌"
 * getOrderStatusEmoji('1');         // "🟢" (numeric status)
 * ```
 */
export function getOrderStatusEmoji(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'pending':
    case '1':
      return '🟢'; // Active/Pending
    case 'filled':
    case 'completed':
    case '4':
      return '✅'; // Filled/Completed
    case 'cancelled':
    case '3':
      return '❌'; // Cancelled
    case 'expired':
    case '7':
      return '⏰'; // Expired
    case 'failed':
    case '2':
      return '🔴'; // Failed
    default:
      return '🔵'; // Unknown status
  }
}

/**
 * Formats a limit order object into a user-friendly display string.
 *
 * Creates a formatted message showing order details including:
 * - Order status with emoji
 * - Token pair and amounts
 * - Creation and expiry dates
 * - Truncated order hash for identification
 *
 * Uses internationalization for localized text.
 *
 * @param order - Limit order information object
 * @param index - Order position in list (0-based)
 * @param t - Translation function from bot context
 * @returns Formatted order display string
 *
 * @example
 * ```typescript
 * const formattedOrder = formatLimitOrder(limitOrder, 0, ctx.t);
 * // Returns: "🟢 Order #1: 1.0000 ETH → 2000.000000 USDC..."
 * ```
 */
export function formatLimitOrder(order: LimitOrderInfo, index: number, t: BotContext['t']): string {
  const statusEmoji = getOrderStatusEmoji(order.status);
  const createdDate = new Date(order.data.createDateTime).toLocaleDateString();
  const expiryDate = new Date(order.data.expiry).toLocaleDateString();
  const makerAmount = parseFloat(order.data.makerAssetAmount).toFixed(4);
  const takerAmount = parseFloat(order.data.takerAssetAmount).toFixed(6);
  const orderHash = order.orderHash.slice(0, 10) + '...';

  return t('limit_order_item_msg', {
    statusEmoji,
    orderNumber: index + 1,
    makerSymbol: order.data.makerAssetSymbol,
    takerSymbol: order.data.takerAssetSymbol,
    makerAmount,
    takerAmount,
    createdDate,
    expiryDate,
    orderHash,
  });
}

/**
 * Formats a DCA (Dollar Cost Averaging) order into a user-friendly display string.
 *
 * Creates a comprehensive formatted message showing:
 * - Order status and progress
 * - Token pair and amounts per interval
 * - Execution schedule and progress
 * - Price range constraints (if set)
 * - Creation and expiry dates
 *
 * @param order - DCA order information object
 * @param index - Order position in list (0-based)
 * @param t - Translation function from bot context
 * @returns Formatted DCA order display string
 *
 * @example
 * ```typescript
 * const formattedDca = formatDcaOrder(dcaOrder, 0, ctx.t);
 * // Returns: "🟢 DCA #1: 0.1000 ETH → USDC every 1 hours (2/10 completed)..."
 * ```
 */
export function formatDcaOrder(order: DcaOrderInfo, index: number, t: BotContext['t']): string {
  const statusEmoji = getOrderStatusEmoji(order.status);
  const createdDate = new Date(order.createDateTime).toLocaleDateString();
  const expiryDate = new Date(order.expireTime).toLocaleDateString();
  const intervalText = formatInterval(order.time);
  const progress = order.have_filled || 0;
  const makerAmount = parseFloat(order.data.makingAmount).toFixed(4);
  const orderHash = order.orderHash.slice(0, 10) + '...';

  // Build price range text if available
  let priceRangeText = '';
  if (order.minPrice || order.maxPrice) {
    const priceLines = [];
    if (order.minPrice) priceLines.push(`📉 Min Price: ${order.minPrice}`);
    if (order.maxPrice) priceLines.push(`📈 Max Price: ${order.maxPrice}`);
    priceRangeText = priceLines.join('\n') + '\n';
  }

  return t('dca_order_item_msg', {
    statusEmoji,
    orderNumber: index + 1,
    makerSymbol: order.data.makerAssetSymbol,
    takerSymbol: order.data.takerAssetSymbol,
    makerAmount,
    intervalText,
    progress,
    totalTimes: order.times,
    createdDate,
    expiryDate,
    priceRangeText,
    orderHash,
  });
}

/**
 * Returns appropriate emoji for transaction status display.
 *
 * Maps Prisma TransactionStatus enum values to emoji icons for
 * visual status indication in transaction lists and notifications.
 *
 * @param status - Transaction status from Prisma enum
 * @returns Emoji character representing the transaction status
 *
 * @example
 * ```typescript
 * getTransactionStatusEmoji(TransactionStatus.PENDING);   // "🟡"
 * getTransactionStatusEmoji(TransactionStatus.COMPLETED); // "✅"
 * getTransactionStatusEmoji(TransactionStatus.FAILED);    // "❌"
 * ```
 */
export function getTransactionStatusEmoji(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.PENDING:
      return '🟡'; // Pending
    case TransactionStatus.COMPLETED:
      return '✅'; // Completed
    case TransactionStatus.FAILED:
      return '❌'; // Failed
    case TransactionStatus.CANCELED:
      return '🚫'; // Canceled
    default:
      return '🔵'; // Unknown status
  }
}

/**
 * Returns appropriate emoji for transaction type display.
 *
 * Maps Prisma TransactionType enum values to emoji icons for
 * visual type indication showing the nature of the transaction.
 *
 * @param type - Transaction type from Prisma enum
 * @returns Emoji character representing the transaction type
 *
 * @example
 * ```typescript
 * getTransactionTypeEmoji(TransactionType.BUY);         // "🟢"
 * getTransactionTypeEmoji(TransactionType.SELL);        // "🔴"
 * getTransactionTypeEmoji(TransactionType.DCA);         // "🔄"
 * getTransactionTypeEmoji(TransactionType.LIMIT_ORDER); // "📊"
 * ```
 */
export function getTransactionTypeEmoji(type: TransactionType): string {
  switch (type) {
    case TransactionType.BUY:
      return '🟢'; // Buy
    case TransactionType.SELL:
      return '🔴'; // Sell
    case TransactionType.DCA:
      return '🔄'; // DCA
    case TransactionType.LIMIT_ORDER:
      return '📊'; // Limit Order
    case TransactionType.WITHDRAW:
      return '💸'; // Withdraw
    default:
      return '🔵'; // Unknown type
  }
}

/**
 * Formats a transaction object into a comprehensive display string.
 *
 * Creates a detailed formatted message showing:
 * - Transaction type and status with emojis
 * - Token amounts and symbols
 * - Transaction details specific to type (buy/sell/DCA/limit/withdraw)
 * - Creation date and time
 * - Truncated transaction hash
 *
 * Handles different transaction types with appropriate formatting and
 * uses internationalization for localized messages.
 *
 * @param transaction - Transaction object from database
 * @param index - Transaction position in list (0-based)
 * @param t - Translation function from bot context
 * @returns Formatted transaction display string
 *
 * @example
 * ```typescript
 * const formattedTx = formatTransaction(transaction, 0, ctx.t);
 * // Returns: "🟢✅ Buy Transaction #1: 0.100000 ETH → USDC (1000.000000 received)..."
 * ```
 */
export function formatTransaction(
  transaction: Transaction,
  index: number,
  t: BotContext['t']
): string {
  const statusEmoji = getTransactionStatusEmoji(transaction.status);
  const typeEmoji = getTransactionTypeEmoji(transaction.type);
  const createdDate = new Date(transaction.createdAt).toLocaleDateString();
  const createdTime = new Date(transaction.createdAt).toLocaleTimeString();

  // Format amounts
  const tokenInAmount = transaction.tokenInAmount?.toFixed(6) || '0';
  const tokenOutAmount = transaction.tokenOutAmount?.toFixed(6) || '0';

  // Format symbols
  const tokenInSymbol = transaction.tokenInSymbol || 'TOKEN';
  const tokenOutSymbol = transaction.tokenOutSymbol || 'TOKEN';

  // Transaction hash (shortened)
  const txHash = transaction.txHash ? transaction.txHash.slice(0, 10) + '...' : 'N/A';

  // Build transaction details based on type
  let details = '';

  switch (transaction.type) {
    case TransactionType.BUY:
      details = t('transaction_buy_details_msg', {
        tokenInAmount,
        tokenInSymbol,
        tokenOutSymbol,
        tokenOutAmount: tokenOutAmount !== '0' ? tokenOutAmount : 'N/A',
      });
      break;
    case TransactionType.SELL:
      details = t('transaction_sell_details_msg', {
        tokenInAmount,
        tokenInSymbol,
        tokenOutSymbol,
        tokenOutAmount: tokenOutAmount !== '0' ? tokenOutAmount : 'N/A',
      });
      break;
    case TransactionType.DCA:
      details = t('transaction_dca_details_msg', {
        tokenInAmount,
        tokenInSymbol,
        tokenOutSymbol,
        times: transaction.times || 'N/A',
        expire: transaction.expire || 'N/A',
      });
      break;
    case TransactionType.LIMIT_ORDER:
      details = t('transaction_limit_details_msg', {
        tokenInAmount,
        tokenInSymbol,
        tokenOutSymbol,
        tokenOutAmount: tokenOutAmount !== '0' ? tokenOutAmount : 'N/A',
        expire: transaction.expire || 'N/A',
      });
      break;
    case TransactionType.WITHDRAW:
      details = t('transaction_withdraw_details_msg', {
        tokenInAmount,
        tokenInSymbol,
        toAddress: transaction.toAddress ? transaction.toAddress.slice(0, 10) + '...' : 'N/A',
      });
      break;
    default:
      details = t('transaction_unknown_details_msg');
  }

  return t('transaction_item_msg', {
    statusEmoji,
    typeEmoji,
    transactionNumber: index + 1,
    type: transaction.type,
    details,
    createdDate,
    createdTime,
    txHash,
    chain: transaction.chain,
  });
}

import { Transaction, TransactionStatus, TransactionType } from '@prisma/client/edge';

import { DcaOrderInfo, LimitOrderInfo } from '@/types/neurodex';
import { BotContext } from '@/types/telegram';

// format interval
export const formatInterval = (seconds: number): string => {
  if (seconds < 3600) return `${seconds} seconds`;
  if (seconds < 86400) return `${seconds / 3600} hours`;
  if (seconds < 604800) return `${seconds / 86400} days`;
  if (seconds < 2592000) return `${seconds / 604800} weeks`;
  return `${seconds / 2592000} months`;
};

// order emoji status
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

// format limit order
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

// format dca order
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

// transaction status emoji
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

// transaction type emoji
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

// format transaction
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
  const tokenInAmount =
    transaction.tokenInAmount?.toFixed(6) || transaction.amount?.toFixed(6) || '0';
  const tokenOutAmount = transaction.tokenOutAmount?.toFixed(6) || '0';

  // Format symbols
  const tokenInSymbol = transaction.tokenInSymbol || transaction.tokenSymbol || 'TOKEN';
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

import { DcaOrderInfo, LimitOrderInfo } from '@/types/neurodex';

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
export function formatLimitOrder(
  order: LimitOrderInfo,
  index: number,
  t: (key: string, params?: Record<string, any>) => string
): string {
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
export function formatDcaOrder(
  order: DcaOrderInfo,
  index: number,
  t: (key: string, params?: Record<string, any>) => string
): string {
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

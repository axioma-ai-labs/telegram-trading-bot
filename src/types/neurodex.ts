import { GasPriority } from '../types/config';

/**
 * Base parameters for trading operations
 */
export interface BaseTradeParams {
  /** Token address to trade */
  tokenAddress: string;
  /** Amount to trade (in wei) */
  amount: string;
  /** Slippage tolerance in percentage */
  slippage?: number;
  /** Gas priority level */
  gasPriority?: GasPriority;
  /** User's wallet address */
  account: string;
}

/**
 * Parameters for buying tokens
 */
export interface BuyParams extends BaseTradeParams {
  /** Amount of native token (ETH/BNB) to spend */
  nativeAmount: string;
}

/**
 * Parameters for selling tokens
 */
export interface SellParams extends BaseTradeParams {
  /** Minimum amount of native token (ETH/BNB) to receive */
  minNativeAmount: string;
}

/**
 * Parameters for DCA (Dollar Cost Averaging) operations
 */
export interface DcaParams extends BaseTradeParams {
  /** Total amount to invest (in wei) */
  totalAmount: string;
  /** Number of intervals */
  intervals: number;
  /** Interval duration in seconds */
  intervalDuration: number;
}

/**
 * Parameters for limit orders
 */
export interface LimitOrderParams extends BaseTradeParams {
  /** Target price in native token */
  targetPrice: string;
  /** Order expiration timestamp */
  expireTime?: number;
}

/**
 * Response wrapper for NeuroDex API calls
 */
export interface NeuroDexResponse<T> {
  /** Success status */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if any */
  error?: string;
  /** Transaction hash if applicable */
  txHash?: string;
}

/**
 * Token information
 */
export interface TokenInfo {
  /** Token address */
  address: string;
  /** Token symbol */
  symbol: string;
  /** Token decimals */
  decimals: number;
  /** Token name */
  name: string;
}

/**
 * Trading pair information
 */
export interface TradingPair {
  /** Base token */
  baseToken: TokenInfo;
  /** Quote token */
  quoteToken: TokenInfo;
  /** Current price in quote token */
  price: string;
  /** 24h volume */
  volume24h: string;
  /** 24h price change percentage */
  priceChange24h: string;
}

/**
 * Order status
 */
export type OrderStatus = 'pending' | 'executed' | 'cancelled' | 'expired';

/**
 * Order information
 */
export interface OrderInfo {
  /** Order ID */
  id: string;
  /** Order type */
  type: 'limit' | 'dca';
  /** Order status */
  status: OrderStatus;
  /** Token being traded */
  token: TokenInfo;
  /** Amount to trade */
  amount: string;
  /** Target price (for limit orders) */
  targetPrice?: string;
  /** Created timestamp */
  createdAt: number;
  /** Expiration timestamp */
  expiresAt?: number;
  /** Transaction hash if executed */
  txHash?: string;
}

/**
 * Wallet information
 */
export interface WalletInfo {
  /** Wallet address */
  address: string;

  privateKey: string;
}

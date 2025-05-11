import { GasPriority } from '@/types/config';

/**
 * Base parameters for trading operations
 */
export interface BaseTradeParams {
  /** Token address to trade */
  tokenAddress: string;
  /** Amount to trade (of trading token) */
  amount: number;
  /** Slippage tolerance in percentage */
  slippage: number;
  /** Gas priority level */
  gasPriority: GasPriority;
  /** User's wallet address */
  walletAddress: string;
  /** User's private key */
  privateKey: string;
  /** Referral code */
  referrer?: string;
}

/**
 * Parameters for DCA (Dollar Cost Averaging) operations
 */
export interface DcaParams extends BaseTradeParams {
  /** Total amount to invest (of trading token) */
  totalAmount: number;
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
  targetPrice: number;
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
  price: number;
  /** 24h volume */
  volume24h: number;
  /** 24h price change percentage */
  priceChange24h: number;
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
  amount: number;
  /** Target price (for limit orders) */
  targetPrice?: number;
  /** Created timestamp */
  createdAt: Date;
  /** Expiration timestamp */
  expiresAt?: Date;
  /** Transaction hash if executed */
  txHash?: string;
}

/**
 * Wallet information
 */
export interface WalletInfo {
  /** Wallet address */
  address: string;
  /** Wallet private key */
  privateKey: string;
}

/**
 * Swap response data
 */
export interface SwapResponse {
  inToken: TokenInfo;
  outToken: TokenInfo;
  inAmount: number;
  outAmount: number;
  estimatedGas: number;
  price_impact: number | undefined;
  txHash: string;
}

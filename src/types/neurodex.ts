import { GasPriority } from '@/types/config';

/**
 * Basic trading parameters for trading operations
 */
export interface BasicTradeParams {
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
 * Buy parameters
 */
export interface BuyParams extends BasicTradeParams {
  /** Token address to buy */
  toTokenAddress: string;
  /** Amount of Native Token to spend */
  fromAmount: number;
}

/**
 * Sell parameters
 */
export interface SellParams extends BasicTradeParams {
  /** Token address to sell */
  fromTokenAddress: string;
  /** Amount to get in Native Token */
  fromAmount: number;
}

/**
 * Parameters for DCA (Dollar Cost Averaging) operations
 */
export interface DcaParams extends BasicTradeParams {
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
export interface LimitOrderParams extends BasicTradeParams {
  /** Target price in native token */
  targetPrice: number;
  /** Order expiration timestamp */
  expireTime?: number;
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
}

/**
 * Extended token data with additional information
 */
export interface TokenData extends TokenInfo {
  /** Token name */
  name: string;
  /** Current price in USD */
  price?: number;
  /** Total supply */
  totalSupply?: number;
  /** Market cap */
  marketCap?: number;
  /** Token logo URL */
  logo?: string;
  /** Chain ID */
  chain: string;
}

/**
 * Swap response data
 */
export interface SwapResult {
  inToken: TokenInfo;
  outToken: TokenInfo;
  inAmount: number;
  outAmount: number;
  estimatedGas: number;
  price_impact: number | undefined;
  txHash: string;
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

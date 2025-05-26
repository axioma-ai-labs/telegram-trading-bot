import { GasPriority } from '@/types/config';
import { DcaOrderAssetData, LimitOrderAssetData } from '@/types/openocean';

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
  /** Maker token address (token to sell) */
  makerTokenAddress: string;
  /** Maker token decimals */
  makerTokenDecimals: number;
  /** Taker token address (token to buy) */
  takerTokenAddress: string;
  /** Taker token decimals */
  takerTokenDecimals: number;
  /** Total amount to invest with decimals */
  makerAmount: string;
  /** Interval time in seconds */
  time: number;
  /** Number of intervals */
  times: number;
  /** Optional minimum price range */
  minPrice?: string;
  /** Optional maximum price range */
  maxPrice?: string;
  /** Expiration time (format: "10M", "1H", "1D", "7D", etc.) */
  expire: string;
}

/**
 * Parameters for limit orders
 */
export interface LimitOrderParams extends BasicTradeParams {
  /** Maker token address (token to sell) */
  makerTokenAddress: string;
  /** Maker token decimals */
  makerTokenDecimals: number;
  /** Taker token address (token to buy) */
  takerTokenAddress: string;
  /** Taker token decimals */
  takerTokenDecimals: number;
  /** Amount of maker token with decimals */
  makerAmount: string;
  /** Amount of taker token with decimals */
  takerAmount: string;
  /** Expiration time (format: "10M", "1H", "1D", "7D", etc.) */
  expire: string;
}

/**
 * Parameters for canceling a limit order
 */
export interface CancelLimitOrderParams extends BasicTradeParams {
  /** Order hash */
  orderHash: string;
  /** Order data */
  orderData: LimitOrderAssetData;
}

/**
 * Parameters for getting limit orders
 */
export interface GetLimitOrdersParams {
  /** Wallet address */
  address: string;
  /** Statuses to filter */
  statuses?: Array<number>;
  /** Page number */
  page?: number;
  /** Limit number */
  limit?: number;
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

/**
 * Limit order information
 */
export interface LimitOrderInfo {
  /** Order hash */
  orderHash: string;
  /** Order status */
  status: string;
  /** Order data */
  data: {
    /** Maker token symbol */
    makerAssetSymbol: string;
    /** Taker token symbol */
    takerAssetSymbol: string;
    /** Maker token amount */
    makerAssetAmount: string;
    /** Taker token amount */
    takerAssetAmount: string;
    /** Maker token address */
    makerAssetAddress: string;
    /** Taker token address */
    takerAssetAddress: string;
    /** Maker address */
    maker: string;
    /** Order hash */
    orderHash: string;
    /** Order creation time */
    createDateTime: number;
    /** Expiration time */
    expiry: number;
  };
}

/**
 * Parameters for canceling a DCA order
 */
export interface CancelDcaOrderParams extends BasicTradeParams {
  /** Order hash */
  orderHash: string;
  /** Order data */
  orderData: DcaOrderAssetData;
}

/**
 * Parameters for getting DCA orders
 */
export interface GetDcaOrdersParams {
  /** Wallet address */
  address: string;
  /** Statuses to filter */
  statuses?: Array<number>;
  /** Limit number */
  limit?: number;
}

/**
 * DCA order information
 */
export interface DcaOrderInfo {
  /** Order hash */
  orderHash: string;
  /** Order status */
  status: string;
  /** Order data */
  data: {
    /** Maker token symbol */
    makerAssetSymbol: string;
    /** Taker token symbol */
    takerAssetSymbol: string;
    /** Maker token amount */
    makingAmount: string;
    /** Taker token amount */
    takingAmount: string;
    /** Maker token address */
    makerAsset: string;
    /** Taker token address */
    takerAsset: string;
    /** Maker address */
    maker: string;
  };
  /** Creation date time */
  createDateTime: string;
  /** Expiration time */
  expireTime: string;
  /** Interval time in seconds */
  time: number;
  /** Number of intervals */
  times: number;
  /** Number of filled intervals */
  have_filled: number | null;
  /** Minimum price */
  minPrice: string | null;
  /** Maximum price */
  maxPrice: string | null;
}

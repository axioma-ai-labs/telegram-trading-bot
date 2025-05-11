/**
 * Supported blockchain networks for OpenOcean integration
 */
export type OpenOceanChain = 'base' | 'ethereum' | 'bsc';

/**
 * Base configuration for OpenOcean client
 */
export interface OpenOceanConfig {
  /** Default chain to use */
  defaultChain: OpenOceanChain;
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
 * Quote response data
 */
export interface QuoteResponse {
  data: {
    inToken: TokenInfo;
    outToken: TokenInfo;
    inAmount: string;
    outAmount: string;
    estimatedGas: string;
    path: string[];
    save: string;
    price_impact: string;
  };
}

/**
 * Swap response data
 */
export interface SwapResponse {
  data: {
    inToken: TokenInfo;
    outToken: TokenInfo;
    inAmount: string;
    outAmount: string;
    estimatedGas: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    price_impact?: string;
  };
}

/**
 * Parameters for swap operation
 */
export interface SwapParams {
  /** Input token address */
  inTokenAddress: string;
  /** Output token address */
  outTokenAddress: string;
  /** Amount to swap (in wei) */
  amount: string;
  /** Gas price in wei */
  gasPrice: string;
  /** Slippage tolerance in percentage */
  slippage: string;
  /** User's wallet address */
  account: string;
  /** Optional referrer address */
  referrer?: string;
}

/**
 * Parameters for reverse quote operation
 */
export interface ReverseQuoteParams {
  /** Input token address */
  inTokenAddress: string;
  /** Output token address */
  outTokenAddress: string;
  /** Desired output amount (in wei) */
  amount: string;
  /** Gas price in wei */
  gasPrice: string;
}

/**
 * Parameters for limit order creation
 */
export interface LimitOrderParams {
  /** Maker token address */
  makerTokenAddress: string;
  /** Taker token address */
  takerTokenAddress: string;
  /** Maker amount (in wei) */
  makerAmount: string;
  /** Taker amount (in wei) */
  takerAmount: string;
  /** User's wallet address */
  account: string;
  /** Optional expiration timestamp */
  expireTime?: number;
}

/**
 * Parameters for DCA order creation
 */
export interface DcaParams {
  /** Input token address */
  inTokenAddress: string;
  /** Output token address */
  outTokenAddress: string;
  /** Total amount to invest (in wei) */
  totalAmount: string;
  /** Number of intervals */
  intervals: number;
  /** Interval duration in seconds */
  intervalDuration: number;
  /** User's wallet address */
  account: string;
  /** Optional slippage tolerance */
  slippage?: string;
}

/**
 * Parameters for quote operation
 */
export interface QuoteParams {
  /** Input token address */
  inTokenAddress: string;
  /** Output token address */
  outTokenAddress: string;
  /** Token amount with decimals */
  amountDecimals?: string;
  /** Gas price with decimals */
  gasPriceDecimals?: string;
  /** Slippage tolerance in percentage (0.05 to 50) */
  slippage?: string;
  /** Disabled DEX IDs separated by commas */
  disabledDexIds?: string;
  /** Enabled DEX IDs separated by commas */
  enabledDexIds?: string;
}

/**
 * Response wrapper for OpenOcean API calls
 */
export interface OpenOceanResponse<T> {
  /** Success status */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if any */
  error?: string;
}

/**
 * Limit order response data
 */
export interface LimitOrderResponse {
  data: {
    id: string;
    makerToken: TokenInfo;
    takerToken: TokenInfo;
    makerAmount: string;
    takerAmount: string;
    account: string;
    status: 'open' | 'filled' | 'cancelled' | 'expired';
    createdAt: number;
    expiresAt?: number;
    txHash?: string;
  };
}

/**
 * DCA order response data
 */
export interface DcaOrderResponse {
  data: {
    id: string;
    inToken: TokenInfo;
    outToken: TokenInfo;
    totalAmount: string;
    intervals: number;
    intervalDuration: number;
    account: string;
    status: 'active' | 'completed' | 'cancelled';
    createdAt: number;
    lastExecutedAt?: number;
    nextExecutionAt?: number;
    txHash?: string;
  };
}

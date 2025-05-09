/**
 * Supported blockchain networks for OpenOcean integration
 */
export type OpenOceanChain = 'base' | 'ethereum' | 'bsc';

/**
 * Base configuration for OpenOcean client
 */
export interface OpenOceanConfig {
  /** RPC endpoint URL */
  rpcUrl: string;
  /** OpenOcean addon ID */
  addonId: string;
  /** Default chain to use */
  defaultChain: OpenOceanChain;
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
  /** Output token address */
  outTokenAddress: string;
  /** Desired output amount (in wei) */
  outAmount: string;
  /** Gas price in wei */
  gasPrice: string;
  /** User's wallet address */
  account: string;
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

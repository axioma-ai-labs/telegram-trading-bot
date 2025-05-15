/**
 * Supported blockchain networks for OpenOcean integration
 */
export type OpenOceanChain = 'base' | 'ethereum' | 'bsc';

// ------------------------------------------------------------
// Parameters
// ------------------------------------------------------------

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
 * Parameters for swap operation
 */
export interface SwapParams {
  /** Input token address */
  inTokenAddress: string;
  /** Output token address */
  outTokenAddress: string;
  /** Amount to swap with decimals (e.g., for 1 USDT use 1000000) */
  amountDecimals: string;
  /** Gas price with decimals */
  gasPriceDecimals: string;
  /** Slippage tolerance in percentage (0.05 to 50), e.g., 1% slippage set as 1 */
  slippage: string;
  /** User's wallet address */
  account: string;
  /** Optional referrer address for tracking */
  referrer?: string;
  /** Optional referrer fee percentage (0.01 to 5), e.g., 1.2% fee set as 1.2 */
  referrerFee?: number;
  /** Optional comma-separated list of DEX IDs to enable */
  enabledDexIds?: string;
  /** Optional comma-separated list of DEX IDs to disable */
  disabledDexIds?: string;
  /** Optional sending address (account becomes receiving address) */
  sender?: string;
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
 * Parameters for OpenOcean limit order SDK
 */
export interface LimitOrderCreateParams {
  /** Maker token address */
  makerTokenAddress: string;
  /** Maker token decimals */
  makerTokenDecimals: number;
  /** Taker token address */
  takerTokenAddress: string;
  /** Taker token decimals */
  takerTokenDecimals: number;
  /** Maker amount with decimals as string */
  makerAmount: string;
  /** Taker amount with decimals as string */
  takerAmount: string;
  /** Gas price */
  gasPrice: number;
  /** Expiration time (format: "10M", "1H", "1D", "7D", etc.) */
  expire: string;
}

/**
 * Parameters for canceling a limit order onchain
 */
export interface LimitOrderCancelOnchainParams {
  /** Order data */
  orderData: any;
  /** Gas price */
  gasPrice: number;
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

// ------------------------------------------------------------
// Responses
// ------------------------------------------------------------

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
  /** Token USD price */
  usd: string;
  /** Token volume */
  volume: number;
}

/**
 * DEX information in quote response
 */
export interface DexInfo {
  /** DEX index */
  dexIndex: number;
  /** DEX code/name */
  dexCode: string;
  /** Swap amount for this DEX */
  swapAmount: string;
}

/**
 * DEX route information
 */
export interface DexRoute {
  /** DEX name */
  dex: string;
  /** DEX contract address */
  id: string;
  /** Number of parts */
  parts: number;
  /** Percentage of the route */
  percentage: number;
}

/**
 * Sub-route information
 */
export interface SubRoute {
  /** From token address */
  from: string;
  /** To token address */
  to: string;
  /** Number of parts */
  parts: number;
  /** DEXes in this route */
  dexes: DexRoute[];
}

/**
 * Route information
 */
export interface Route {
  /** Number of parts */
  parts: number;
  /** Percentage of the route */
  percentage: number;
  /** Sub-routes */
  subRoutes: SubRoute[];
}

/**
 * Path information
 */
export interface Path {
  /** From token address */
  from: string;
  /** To token address */
  to: string;
  /** Total number of parts */
  parts: number;
  /** Routes */
  routes: Route[];
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
    dexes: DexInfo[];
    path: Path;
    save: number;
    price_impact: string;
    exchange: string;
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
    estimatedGas: number;
    minOutAmount?: string;
    from: string;
    to: string;
    value: string;
    gasPrice: string;
    data: string;
    chainId: number;
    rfqDeadline?: number;
    gmxFee?: number;
    price_impact?: string;
  };
}

/**
 * Token List response data
 */
export interface TokenListResponse {
  data: {
    tokens: TokenInfo[];
  };
}

/**
 * EIP-1559 gas price details
 */
export interface Eip1559GasPrice {
  /** Legacy gas price in wei */
  legacyGasPrice: number;
  /** Max priority fee per gas in wei */
  maxPriorityFeePerGas: number;
  /** Max fee per gas in wei */
  maxFeePerGas: number;
  /** Estimated wait time in milliseconds */
  waitTimeEstimate: number;
}

/**
 * Gas price value can be either a simple number (legacy) or EIP-1559 details
 */
export type GasPriceValue = number | Eip1559GasPrice;

/**
 * Gas price response data
 */
export interface GasPriceResponse {
  data: {
    /** Base gas price (only present in EIP-1559 responses) */
    base?: number;
    /** Standard gas price */
    standard: GasPriceValue;
    /** Fast gas price */
    fast: GasPriceValue;
    /** Instant gas price */
    instant: GasPriceValue;
    /** Low gas price (only present in EIP-1559 responses) */
    low?: GasPriceValue;
  };
  /** Gas prices without decimals (in ETH) */
  without_decimals: {
    /** Base gas price (only present in EIP-1559 responses) */
    base?: number;
    /** Standard gas price */
    standard:
      | number
      | {
          legacyGasPrice: number;
          maxPriorityFeePerGas: number;
          maxFeePerGas: number;
          waitTimeEstimate: number;
        };
    /** Fast gas price */
    fast:
      | number
      | {
          legacyGasPrice: number;
          maxPriorityFeePerGas: number;
          maxFeePerGas: number;
          waitTimeEstimate: number;
        };
    /** Instant gas price */
    instant:
      | number
      | {
          legacyGasPrice: number;
          maxPriorityFeePerGas: number;
          maxFeePerGas: number;
          waitTimeEstimate: number;
        };
    /** Low gas price (only present in EIP-1559 responses) */
    low?:
      | number
      | {
          legacyGasPrice: number;
          maxPriorityFeePerGas: number;
          maxFeePerGas: number;
          waitTimeEstimate: number;
        };
  };
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

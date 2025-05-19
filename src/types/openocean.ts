import Web3 from 'web3';

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
  orderData: LimitOrderAssetData;
  /** Gas price */
  gasPrice: number;
}

/**
 * Parameters for DCA order creation with SDK
 */
export interface DcaOrderCreateParams {
  /** Web3 provider */
  provider: Web3;
  /** Account address */
  address: string;
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
  /** Taker amount with decimals as string (default "1") */
  takerAmount?: string;
  /** Gas price */
  gasPrice: number;
  /** Expiration time (format: "10M", "1H", "1D", "7D", etc.) */
  expire: string;
  /** Optional receiver address */
  receiver?: string;
  /** Optional receiver input data */
  receiverInputData?: string;
  /** Interval time in seconds */
  time: number;
  /** Frequency of the DCA order */
  times: number;
  /** Optional minimum price range */
  minPrice?: string;
  /** Optional maximum price range */
  maxPrice?: string;
  /** Optional version (v1 or v2) */
  version?: string;
  /** Optional referrer address */
  referrer?: string;
  /** Optional referrer fee percentage (0-5) */
  referrerFee?: string;
}

/**
 * DCA order data structure
 */
export interface DcaOrderData {
  /** Salt value from SDK */
  salt: string;
  /** Maker token address */
  makerAsset: string;
  /** Taker token address */
  takerAsset: string;
  /** Maker address */
  maker: string;
  /** Receiver address */
  receiver: string;
  /** Allowed sender address */
  allowedSender: string;
  /** Making amount with decimals */
  makingAmount: string;
  /** Taking amount with decimals */
  takingAmount: string;
  /** Maker asset data */
  makerAssetData: string;
  /** Taker asset data */
  takerAssetData: string;
  /** Get maker amount function data */
  getMakerAmount: string;
  /** Get taker amount function data */
  getTakerAmount: string;
  /** Predicate data */
  predicate: string;
  /** Permit data */
  permit: string;
  /** Interaction data */
  interaction: string;
}

/**
 * Parameters for DCA order API creation
 */
export interface DcaOrderCreateApiParams {
  /** Total amount with decimals */
  makerAmount: string;
  /** Default amount (usually "1") */
  takerAmount: string;
  /** User signature */
  signature: string;
  /** Order hash */
  orderHash: string;
  /** Wallet address */
  orderMaker: string;
  /** Remaining amount */
  remainingMakerAmount: string;
  /** Order data from SDK */
  data: DcaOrderData;
  /** Whether order is active */
  isActive: boolean;
  /** Chain ID */
  chainId: number;
  /** Expire time in seconds */
  expireTime: number;
  /** Amount rate */
  amountRate: string;
  /** Interaction data */
  interaction: string;
  /** Interval time in seconds */
  time: number;
  /** Number of intervals */
  times: number;
  /** Optional minimum price */
  minPrice?: string;
  /** Optional maximum price */
  maxPrice?: string;
  /** Optional version (v1 or v2) */
  version?: string;
  /** Optional referrer address */
  referrer?: string;
  /** Optional referrer fee percentage (0-5) */
  referrerFee?: string;
}

/**
 * Parameters for canceling a DCA order onchain
 */
export interface DcaOrderCancelOnchainParams {
  /** Order data */
  orderData: DcaOrderAssetData;
  /** Gas price */
  gasPrice: number;
}

/**
 * Parameters for getting DCA order data
 */
export interface DcaOrderGetParams {
  /** Statuses of the DCA order */
  statuses: Array<number>;
  /** Order hash */
  orderHash: string;
  /** Limit of the DCA order */
  limit?: number;
  /** Account address (only for getting DCA for specific account) */
  address?: string;
}

// ------------------------------------------------------------
// Responses
// ------------------------------------------------------------

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
 * Limit order asset data
 */
export interface LimitOrderAssetData {
  /** Asset address */
  makerAsset: string;
  /** Asset symbol */
  makerAssetSymbol: string;
  /** Asset decimals */
  makerAssetDecimals: number;
  /** Asset icon URL */
  makerAssetIcon: string;
  /** Taker asset address */
  takerAsset: string;
  /** Taker asset symbol */
  takerAssetSymbol: string;
  /** Taker asset decimals */
  takerAssetDecimals: number;
  /** Taker asset icon URL */
  takerAssetIcon: string;
  /** Get maker amount function data */
  getMakerAmount: string;
  /** Get taker amount function data */
  getTakerAmount: string;
  /** Maker asset data */
  makerAssetData: string;
  /** Taker asset data */
  takerAssetData: string;
  /** Salt value */
  salt: string;
  /** Permit data */
  permit: string;
  /** Predicate data */
  predicate: string;
  /** Interaction data */
  interaction: string;
  /** Making amount */
  makingAmount: string;
  /** Taking amount */
  takingAmount: string;
  /** Maker address */
  maker: string;
  /** Receiver address */
  receiver: string;
  /** Allowed sender address */
  allowedSender: string;
}

/**
 * Limit order item
 */
export interface LimitOrderItem {
  /** Maker amount */
  makerAmount: string;
  /** Taker amount */
  takerAmount: string;
  /** Order signature */
  signature: string;
  /** Order hash */
  orderHash: string;
  /** Creation date time */
  createDateTime: string;
  /** Order maker address */
  orderMaker: string;
  /** Remaining maker amount */
  remainingMakerAmount: string;
  /** Maker balance */
  makerBalance: string | null;
  /** Maker allowance */
  makerAllowance: string | null;
  /** Expiration time */
  expireTime: string;
  /** Order status */
  statuses: number;
  /** Order data */
  data: LimitOrderAssetData;
  /** Maker rate */
  makerRate: string | null;
  /** Taker rate */
  takerRate: string | null;
}

/**
 * Limit orders response data
 */
export interface LimitOrdersResponse {
  /** Response code */
  code: number;
  /** List of limit orders */
  data: LimitOrderItem[];
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
 * DCA order asset data
 */
export interface DcaOrderAssetData {
  /** Maker token address */
  makerAsset: string;
  /** Maker token symbol */
  makerAssetSymbol: string;
  /** Maker token decimals */
  makerAssetDecimals: number;
  /** Maker token icon URL */
  makerAssetIcon: string;
  /** Taker token address */
  takerAsset: string;
  /** Taker token symbol */
  takerAssetSymbol: string;
  /** Taker token decimals */
  takerAssetDecimals: number;
  /** Taker token icon URL */
  takerAssetIcon: string;
  /** Get maker amount function data */
  getMakerAmount: string;
  /** Get taker amount function data */
  getTakerAmount: string;
  /** Maker asset data */
  makerAssetData: string;
  /** Taker asset data */
  takerAssetData: string;
  /** Salt value */
  salt: string;
  /** Permit data */
  permit: string;
  /** Predicate data */
  predicate: string;
  /** Interaction data */
  interaction: string;
  /** Making amount */
  makingAmount: string;
  /** Taking amount */
  takingAmount: string;
  /** Maker address */
  maker: string;
  /** Receiver address */
  receiver: string;
  /** Allowed sender address */
  allowedSender: string;
}

/**
 * DCA order response item
 */
export interface DcaOrderItem {
  /** Maker amount */
  makerAmount: string;
  /** Taker amount */
  takerAmount: string;
  /** Order hash */
  orderHash: string;
  /** Creation date time */
  createDateTime: string;
  /** Order maker address */
  orderMaker: string;
  /** Remaining maker amount */
  remainingMakerAmount: string;
  /** Maker balance */
  makerBalance: string | null;
  /** Maker allowance */
  makerAllowance: string | null;
  /** Expiration time */
  expireTime: string;
  /** Order status */
  statuses: number;
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
  /** Order data */
  data: DcaOrderAssetData;
  /** Maker rate */
  makerRate: string | null;
  /** Taker rate */
  takerRate: string | null;
}

/**
 * DCA orders list response
 */
export interface DcaOrdersResponse {
  /** Response code */
  code: number;
  /** List of DCA orders */
  data: DcaOrderItem[];
}

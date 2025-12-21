/**
 * @category Core
 */
import { Chain } from 'viem';
import { base, bsc, mainnet } from 'viem/chains';

import { GasPriority } from '@/types/config';
import { DcaOrderAssetData, LimitOrderAssetData } from '@/types/openocean';

// ------------------------------------------------------------
// Definitions
// ------------------------------------------------------------

/**
 * Possible states for trading orders in the system.
 *
 * @example
 * ```typescript
 * const orderStatus: OrderStatus = 'pending';
 * if (orderStatus === 'executed') {
 *   console.log('Order completed successfully');
 * }
 * ```
 */
export type OrderStatus = 'pending' | 'executed' | 'cancelled' | 'expired';

/**
 * Supported blockchain networks for NeuroDex trading operations.
 *
 * Each network corresponds to a specific blockchain with its own
 * token ecosystem and DEX infrastructure.
 *
 * @example
 * ```typescript
 * const chain: NeuroDexChain = 'base';
 * const neuroDex = new NeuroDexApi(chain);
 * ```
 */
export type NeuroDexChain = 'base' | 'ethereum' | 'bsc';

/**
 * Mapping of NeuroDexChain identifiers to their corresponding OpenOcean chain IDs.
 *
 * Used for API calls to OpenOcean DEX aggregator service.
 *
 * @example
 * ```typescript
 * const chainId = NeuroDexChainToOpenOceanChain['base']; // 8453
 * ```
 */
export const NeuroDexChainToOpenOceanChain: Record<NeuroDexChain, number> = {
  base: 8453,
  ethereum: 1,
  bsc: 56,
};

/**
 * Mapping of NeuroDexChain identifiers to Viem chain configuration objects.
 *
 * Used for blockchain interactions through the Viem library.
 *
 * @example
 * ```typescript
 * const viemChain = NeuroDexChainToViemChain['base']; // base chain config
 * const viemService = new ViemService(viemChain);
 * ```
 */
export const NeuroDexChainToViemChain: Record<NeuroDexChain, Chain> = {
  base: base,
  ethereum: mainnet,
  bsc: bsc,
};

// ------------------------------------------------------------
// Parameters
// ------------------------------------------------------------

/**
 * Base parameters required for all trading operations.
 *
 * Provides common configuration needed for executing trades including
 * slippage tolerance, gas settings, wallet authentication, and referral tracking.
 *
 * @example
 * ```typescript
 * const basicParams: BasicTradeParams = {
 *   slippage: 1,                    // 1% slippage tolerance
 *   gasPriority: 'standard',        // Gas price preference
 *   walletAddress: '0x742d35...',   // User's wallet
 *   privateKey: '0x1234...',        // For signing transactions
 *   referrer: '0x8159...'          // Optional referral address
 * };
 * ```
 */
export interface BasicTradeParams {
  /** Slippage tolerance in percentage (e.g., 1 for 1%) */
  slippage: number;
  /** Gas priority level affecting transaction speed and cost */
  gasPriority: GasPriority;
  /** User's wallet address for the transaction */
  walletAddress: string;
  /** User's private key for transaction signing */
  privateKey: string;
  /** Optional referrer address for fee sharing */
  referrer?: string;
}

/**
 * Parameters for buying tokens using native currency.
 *
 * Extends BasicTradeParams with buy-specific configuration.
 * Uses the network's native token (ETH, BNB) as the input currency.
 *
 * @example
 * ```typescript
 * const buyParams: BuyParams = {
 *   toTokenAddress: '0xA0b86a33E6411A3Ab7e3AC05934AD6a4d923f3e',  // USDC
 *   fromAmount: 0.1,                    // 0.1 ETH
 *   slippage: 1,
 *   gasPriority: 'standard',
 *   walletAddress: '0x742d35...',
 *   privateKey: '0x1234...'
 * };
 * ```
 */
export interface BuyParams extends BasicTradeParams {
  /** Contract address of the token to purchase */
  toTokenAddress: string;
  /** Amount of native token to spend (in human-readable format) */
  fromAmount: number;
}

/**
 * Parameters for selling tokens to receive native currency.
 *
 * Extends BasicTradeParams with sell-specific configuration.
 * Converts the specified token back to the network's native currency.
 *
 * @example
 * ```typescript
 * const sellParams: SellParams = {
 *   fromTokenAddress: '0xA0b86a33E6411A3Ab7e3AC05934AD6a4d923f3e',  // USDC
 *   fromAmount: 1000,                   // 1000 USDC
 *   slippage: 1,
 *   gasPriority: 'fast',
 *   walletAddress: '0x742d35...',
 *   privateKey: '0x1234...'
 * };
 * ```
 */
export interface SellParams extends BasicTradeParams {
  /** Contract address of the token to sell */
  fromTokenAddress: string;
  /** Amount of token to sell (in human-readable format) */
  fromAmount: number;
}

/**
 * Parameters for withdrawing native tokens
 */
export interface WithdrawParams extends BasicTradeParams {
  /** Recipient wallet address */
  toAddress: string;
  /** Amount of native token to withdraw (in human-readable format, e.g., 0.1) */
  amount: number;
}

/**
 * Parameters for DCA (Dollar Cost Averaging) operations
 */
export interface DcaParams extends BasicTradeParams {
  /** Token address to buy */
  toTokenAddress: string;
  /** Amount of native token to spend (e.g., 0.1 for 0.1 ETH) */
  fromAmount: number;
  /** Interval time in seconds */
  time: number;
  /** Number of intervals */
  times: number;
  /** Expiration time (format: "10M", "1H", "1D", "7D", etc.) */
  expire: string;
  /** Optional minimum price range */
  minPrice?: string;
  /** Optional maximum price range */
  maxPrice?: string;
}

/**
 * Parameters for limit orders
 */
export interface LimitOrderParams extends BasicTradeParams {
  /** Token address to sell */
  fromTokenAddress: string;
  /** Token address to buy */
  toTokenAddress: string;
  /** Amount of token to sell (in human-readable format, e.g., 1.5) */
  fromAmount: number;
  /** Amount of token to buy (in human-readable format, e.g., 0.001) */
  toAmount: number;
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
}

/**
 * Extended token data with additional information
 *
 * Note: When returned by getTokenDataByContractAddress(), name, symbol, chain, and price
 * are guaranteed to be defined (with safe defaults if not available from the API).
 */
export interface TokenData extends TokenInfo {
  /** Token name (guaranteed to be defined when from getTokenDataByContractAddress) */
  name: string;
  /** Current price in USD (guaranteed to be defined when from getTokenDataByContractAddress, defaults to 0) */
  price: number;
  /** Total supply */
  totalSupply?: number;
  /** Market cap */
  marketCap?: number;
  /** Token logo URL */
  logo?: string;
  /** Chain ID (guaranteed to be defined when from getTokenDataByContractAddress) */
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
 * Withdrawal result data
 */
export interface WithdrawResult {
  /** Transaction hash */
  txHash: string;
  /** Amount withdrawn in wei */
  amount: string;
  /** Recipient address */
  toAddress: string;
  /** Sender address */
  fromAddress: string;
  /** Estimated gas used */
  gasUsed: string;
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

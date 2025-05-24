import { Context, SessionFlavor } from 'grammy';
import { Address } from 'viem';

export type OperationType = 'buy' | 'sell' | 'dca' | 'limit' | null;

export interface OperationState {
  type: OperationType;
  token?: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenChain?: string;
  amount?: number;
  interval?: number;
  times?: number;
}

/**
 * Session data interface
 */
export interface SessionData {
  userId?: number;
  username?: string;
  startTime: number;
  lastInteractionTime: number;
  currentOperation: OperationState | null;
  user?: {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
    updatedAt: Date;
    referralCode: string | null;
    referredById: string | null;
    termsAccepted: boolean;
    wallets: Array<{
      id: string;
      address: string;
      chain: string;
      type: string;
      encryptedPrivateKey: string | null;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
    }>;
    settings: {
      id: string;
      userId: string;
      language: string;
      autoTrade: boolean;
      proMode: boolean;
      createdAt: Date;
      updatedAt: Date;
      gasPriority: string;
      slippage: string;
    } | null;
    referralStats: {
      id: string;
      userId: string;
      feeRate: number;
      totalReferrals: number;
      totalTrades: number;
      totalVolume: number;
      totalEarned: number;
      createdAt: Date;
      updatedAt: Date;
    } | null;
    cachedAt: number;
  };
}

/**
 * Custom context type with session
 */
export type BotContext = Context & SessionFlavor<SessionData>;

export type Environment = 'development' | 'production';
export type GasPriority = 'fast' | 'instant' | 'standard';

export interface ChainConfig {
  baseChainId: number;
  baseSepoliaChainId: number;
  ethereumChainId: number;
  bnbChainId: number;
}

export interface TradingConfig {
  defaultSlippage: number;
  defaultFee: number;
  defaultFeeWallet: string;
  defaultGasPriority: GasPriority;
}

export interface WalletConfig {
  encryptionKey: string;
}

export interface DatabaseConfig {
  url: string;
  encryptionKey: string;
}

export interface NodeConfig {
  ethereumMainnetRpc: string;
  baseMainnetRpc: string;
  baseSepoliaRpc: string;
  bncRpc: string;
}

export interface NativeTokenAddress {
  base: string;
  ethereum: string;
  bsc: string;
}

export interface AppConfig {
  projectName: string;
  environment: Environment;
  telegramBotToken: string;
  chain: ChainConfig;
  nativeTokenAddress: NativeTokenAddress;
  trading: TradingConfig;
  wallet: WalletConfig;
  database: DatabaseConfig;
  node: NodeConfig;
  covalenthqApiKey: string;
  // Constants
  MAX_UINT256: string;
}

export interface GasPriceInfo {
  confidence: number;
  price: number;
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
}

export interface GasEstimate {
  legacyGasPrice: number;
  maxPriorityFeePerGas: number;
  maxFeePerGas: number;
  waitTimeEstimate: number;
}

export interface GasData {
  base: number;
  standard: GasEstimate;
  fast: GasEstimate;
  instant: GasEstimate;
  low: GasEstimate;
}

export interface GasResponse {
  code: number;
  data: GasData;
  without_decimals: {
    base: number;
    standard: GasEstimate;
    fast: GasEstimate;
    instant: GasEstimate;
    low: GasEstimate;
  };
}

export interface TokenInfo {
  address: Address;
  symbol: string;
  decimals: number;
  balance: string;
  usd?: number;
}

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

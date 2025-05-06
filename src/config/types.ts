export type Environment = 'development' | 'production';
export type GasPriority = 'low' | 'medium' | 'high';
import { Address } from 'viem';

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
  path: string;
}

export interface NodeConfig {
  ethereumMainnetRpc: string;
  baseMainnetRpc: string;
  baseSepoliaRpc: string;
  bncRpc: string;
  openOceanAddonId: string;
}

export interface AppConfig {
  projectName: string;
  environment: Environment;
  telegramBotToken: string;
  chain: ChainConfig;
  trading: TradingConfig;
  wallet: WalletConfig;
  database: DatabaseConfig;
  node: NodeConfig;
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

/**
 * Interface for individual token balance from CoinStats API
 */
export interface CoinStatsBalance {
  coinId: string;
  amount: number;
  decimals?: number;
  contractAddress?: string;
  chain: string;
  name: string;
  symbol: string;
  price: number;
  priceBtc: number;
  imgUrl: string;
  pCh24h: number;
  rank: number;
  volume: number;
}

/**
 * Interface for blockchain-specific balances
 */
export interface CoinStatsBlockchainBalance {
  blockchain: string;
  balances: CoinStatsBalance[];
}

/**
 * Interface for formatted balance display
 */
export interface FormattedBalance {
  symbol: string;
  amount: string;
  usdValue: string;
  change24h: string;
  chain: string;
}

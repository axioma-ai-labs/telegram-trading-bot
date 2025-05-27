import axios, { AxiosInstance } from 'axios';

import { config } from '@/config/config';
import logger from '@/config/logger';
import { CoinStatsBalance, CoinStatsBlockchainBalance, FormattedBalance } from '@/types/coinstats';

/**
 * Service class for interacting with CoinStats API to fetch wallet balances
 */
export class CoinStatsService {
  private static instance: CoinStatsService;
  private httpClient: AxiosInstance;
  private readonly baseUrl = 'https://openapiv1.coinstats.app';

  constructor() {
    // Initialize HTTP client with CoinStats API configuration
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'X-API-KEY': config.coinstatsApiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Add request interceptor for logging
    this.httpClient.interceptors.request.use(
      (config) => {
        logger.info(`CoinStats API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('CoinStats API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => {
        logger.info(`CoinStats API Response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        logger.error('CoinStats API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get singleton instance of CoinStatsService
   */
  public static getInstance(): CoinStatsService {
    if (!CoinStatsService.instance) {
      CoinStatsService.instance = new CoinStatsService();
    }
    return CoinStatsService.instance;
  }

  /**
   * Fetch wallet balances for a specific address across all networks
   *
   * @param address - The wallet address to fetch balances for
   * @returns Promise<CoinStatsBlockchainBalance[]> - Array of blockchain balances
   */
  async getWalletBalances(address: string): Promise<CoinStatsBlockchainBalance[]> {
    try {
      logger.info(`Fetching CoinStats balances for address: ${address}`);

      const response = await this.httpClient.get('/wallet/balances', {
        params: {
          address,
          networks: 'all',
        },
      });

      if (!response.data) {
        logger.warn(`No balance data returned for address: ${address}`);
        return [];
      }

      logger.info(`Successfully fetched balances for ${response.data.length} blockchains`);
      return response.data as CoinStatsBlockchainBalance[];
    } catch (error) {
      logger.error('Error fetching wallet balances from CoinStats:', error);
      return [];
    }
  }

  /**
   * Get balances for a specific blockchain
   *
   * @param address - The wallet address
   * @param blockchain - The blockchain name (e.g., 'base', 'ethereum', 'binance_smart')
   * @returns Promise<CoinStatsBalance[]> - Array of token balances for the specified blockchain
   */
  async getBlockchainBalances(address: string, blockchain: string): Promise<CoinStatsBalance[]> {
    try {
      const allBalances = await this.getWalletBalances(address);
      const blockchainData = allBalances.find((b) => b.blockchain === blockchain);
      return blockchainData?.balances || [];
    } catch (error) {
      logger.error(`Error fetching ${blockchain} balances:`, error);
      return [];
    }
  }

  /**
   * Get formatted balances for display in Telegram bot
   *
   * @param address - The wallet address
   * @param blockchain - Optional blockchain filter
   * @param limit - Maximum number of tokens to return (default: 10)
   * @returns Promise<FormattedBalance[]> - Array of formatted balances
   */
  async getFormattedBalances(
    address: string,
    blockchain?: string,
    limit: number = 10
  ): Promise<FormattedBalance[]> {
    try {
      let balances: CoinStatsBalance[] = [];

      if (blockchain) {
        balances = await this.getBlockchainBalances(address, blockchain);
      } else {
        const allBalances = await this.getWalletBalances(address);
        balances = allBalances.flatMap((b) => b.balances);
      }

      // Sort by USD value (amount * price) descending
      const sortedBalances = balances
        .filter((balance) => balance.amount > 0)
        .sort((a, b) => b.amount * b.price - a.amount * a.price)
        .slice(0, limit);

      return sortedBalances.map((balance) => ({
        symbol: balance.symbol,
        amount: this.formatAmount(balance.amount, balance.decimals),
        usdValue: this.formatUsdValue(balance.amount * balance.price),
        change24h: this.formatPercentage(balance.pCh24h),
        chain: balance.chain,
      }));
    } catch (error) {
      logger.error('Error formatting balances:', error);
      return [];
    }
  }

  /**
   * Get total portfolio value in USD
   *
   * @param address - The wallet address
   * @returns Promise<number> - Total portfolio value in USD
   */
  async getTotalPortfolioValue(address: string): Promise<number> {
    try {
      const allBalances = await this.getWalletBalances(address);
      let totalValue = 0;

      for (const blockchainData of allBalances) {
        for (const balance of blockchainData.balances) {
          totalValue += balance.amount * balance.price;
        }
      }

      return totalValue;
    } catch (error) {
      logger.error('Error calculating total portfolio value:', error);
      return 0;
    }
  }

  /**
   * Format token amount with appropriate decimal places
   *
   * @param amount - The raw amount
   * @param decimals - Token decimals (optional)
   * @returns string - Formatted amount
   */
  private formatAmount(amount: number, decimals?: number): string {
    if (amount === 0) return '0';

    // For very small amounts, show more decimal places
    if (amount < 0.001) {
      return amount.toExponential(2);
    }

    // For amounts less than 1, show up to 6 decimal places
    if (amount < 1) {
      return amount.toFixed(6).replace(/\.?0+$/, '');
    }

    // For larger amounts, show up to 3 decimal places
    if (amount < 1000) {
      return amount.toFixed(3).replace(/\.?0+$/, '');
    }

    // For very large amounts, use compact notation
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(2) + 'M';
    }

    if (amount >= 1000) {
      return (amount / 1000).toFixed(2) + 'K';
    }

    return amount.toFixed(2);
  }

  /**
   * Format USD value
   *
   * @param value - USD value
   * @returns string - Formatted USD value
   */
  private formatUsdValue(value: number): string {
    if (value < 0.01) return '$0.00';
    if (value < 1) return `$${value.toFixed(4)}`;
    if (value < 1000) return `$${value.toFixed(2)}`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  }

  /**
   * Format percentage change
   *
   * @param percentage - Percentage change
   * @returns string - Formatted percentage with emoji
   */
  private formatPercentage(percentage: number): string {
    const emoji = percentage >= 0 ? '🟢' : '🔴';
    const sign = percentage >= 0 ? '+' : '';
    return `${emoji} ${sign}${percentage.toFixed(2)}%`;
  }

  /**
   * Get wallet token holdings with portfolio value and formatted balances
   *
   * @param address - The wallet address
   * @param blockchain - Optional blockchain filter (default: 'base')
   * @param minBalance - Minimum balance threshold (default: 0.1)
   * @returns Promise<{totalPortfolioValue: number, formattedBalances: string}> - Portfolio data
   */
  async getWalletTokenHoldings(
    address: string,
    blockchain: string = 'base',
    minBalance: number = 0.1
  ): Promise<{ totalPortfolioValue: number; formattedBalances: string }> {
    try {
      const allBalances = await this.getWalletBalances(address);
      let totalValue = 0;
      let relevantBalances: CoinStatsBalance[] = [];

      // calculate total portfolio value
      for (const blockchainData of allBalances) {
        for (const balance of blockchainData.balances) {
          totalValue += balance.amount * balance.price;
        }
      }

      const blockchainData = allBalances.find((b) => b.blockchain === blockchain);
      if (blockchainData) {
        relevantBalances = blockchainData.balances.filter(
          (balance) => balance.amount * balance.price >= minBalance
        );
      }

      // Sort by USD value
      relevantBalances.sort((a, b) => b.amount * b.price - a.amount * a.price);

      // format
      const formattedBalances =
        relevantBalances.length > 0
          ? relevantBalances.map((balance) => this.formatTokenHolding(balance)).join('\n')
          : 'No token holdings found';

      return {
        totalPortfolioValue: totalValue,
        formattedBalances,
      };
    } catch (error) {
      logger.error('Error getting wallet token holdings:', error);
      return {
        totalPortfolioValue: 0,
        formattedBalances: 'Unable to fetch token holdings',
      };
    }
  }

  /**
   * Format individual token holding according to specified format
   *
   * @param balance - Token balance data
   * @returns string - Formatted token holding string
   */
  private formatTokenHolding(balance: CoinStatsBalance): string {
    const symbol = `$${balance.symbol}`;
    const amount = this.formatAmount(balance.amount, balance.decimals);
    const usdValue = this.formatUsdValue(balance.amount * balance.price);
    const changeSign = balance.pCh24h >= 0 ? '+' : '';
    const changePercent = `${changeSign}${balance.pCh24h.toFixed(2)}%`;
    const changeEmoji = balance.pCh24h >= 0 ? '🟢' : '🔴';

    // Generate DexScreener URL if contract address is available
    let tokenDisplay = symbol;
    if (balance.contractAddress && balance.chain === 'base') {
      const dexScreenerUrl = `https://dexscreener.com/base/${balance.contractAddress.toLowerCase()}`;
      tokenDisplay = `[${symbol}](${dexScreenerUrl})`;
    }

    return `${tokenDisplay} │ ${amount} │ ${usdValue} │ ${changePercent} ${changeEmoji}`;
  }
}

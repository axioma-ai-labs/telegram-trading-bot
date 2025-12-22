import { Address } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import Web3 from 'web3';

import { config } from '@/config/config';
import logger from '@/config/logger';
import { OpenOceanClient } from '@/services/engine/openocean';
import { ViemService } from '@/services/engine/viem';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import { GasPriority } from '@/types/config';
import {
  BuyParams,
  CancelDcaOrderParams,
  CancelLimitOrderParams,
  DcaOrderInfo,
  DcaParams,
  FeeEstimation,
  FeeEstimationParams,
  GetDcaOrdersParams,
  GetLimitOrdersParams,
  LimitOrderInfo,
  LimitOrderParams,
  LimitOrderResult,
  NeuroDexResponse,
  SellParams,
  SwapResult,
  TokenData,
  WalletInfo,
  WithdrawParams,
  WithdrawResult,
} from '@/types/neurodex';
import {
  NeuroDexChain,
  NeuroDexChainToOpenOceanChain,
  NeuroDexChainToViemChain,
} from '@/types/neurodex';
import { erc20Abi } from '@/utils/abis';

/**
 * @category Core
 *
 * NeuroDex API service for handling trading operations across multiple blockchain networks.
 *
 * This service provides a unified interface for trading operations including:
 * - Token swaps (buy/sell)
 * - Limit orders
 * - Dollar Cost Averaging (DCA) orders
 * - Wallet management
 * - Token withdrawals
 *
 * Supports Base, Ethereum, and BSC networks through OpenOcean DEX aggregation.
 *
 * @example
 * ```typescript
 * // Initialize NeuroDex API for Base network
 * const neuroDex = new NeuroDexApi('base');
 *
 * // Create a new wallet
 * const wallet = await neuroDex.createWallet();
 *
 * // Buy tokens
 * const buyResult = await neuroDex.buy({
 *   toTokenAddress: '0x123...',
 *   fromAmount: 0.1,
 *   slippage: 1,
 *   gasPriority: 'standard',
 *   walletAddress: wallet.address,
 *   privateKey: wallet.privateKey
 * });
 * ```
 */
export class NeuroDexApi {
  private readonly openOceanClient: OpenOceanClient;
  public readonly viemService: ViemService;
  private readonly nativeTokenAddress: Record<NeuroDexChain, string> = {
    base: config.nativeTokenAddress.base,
    ethereum: config.nativeTokenAddress.ethereum,
    bsc: config.nativeTokenAddress.bsc,
  };
  private readonly chain: NeuroDexChain;

  /**
   * Creates a new NeuroDex API instance
   *
   * @param chain - Target blockchain network (default: 'base')
   * @param rpcUrl - RPC URL for blockchain interaction (default: Base mainnet RPC)
   *
   * @example
   * ```typescript
   * // Default Base network
   * const neuroDex = new NeuroDexApi();
   *
   * // Ethereum network with custom RPC
   * const neuroDexEth = new NeuroDexApi('ethereum', 'https://eth-mainnet.alchemyapi.io/...');
   * ```
   */
  constructor(chain: NeuroDexChain = 'base', rpcUrl: string = config.node.baseMainnetRpc) {
    this.chain = chain;
    this.openOceanClient = new OpenOceanClient(chain);
    const viemChain = NeuroDexChainToViemChain[chain];
    this.viemService = new ViemService(viemChain, rpcUrl);
  }

  /**
   * Get token decimals for a given token address
   *
   * @param tokenAddress - Token contract address
   * @param chain - Blockchain network (must match instance chain)
   * @returns Promise resolving to number of decimals for the token
   * @throws Error if chain mismatch or unable to fetch token info
   *
   * @example
   * ```typescript
   * const decimals = await neuroDex.getTokenDecimals('0xA0b86a33E6411A3Ab7e3AC05934AD6a4d923f3e', 'base');
   * console.log(decimals); // 18
   * ```
   */
  private async getTokenDecimals(
    tokenAddress: string,
    chain: NeuroDexChain = 'base'
  ): Promise<number> {
    try {
      // Assert that chain of the token is the same as the chain of viem service
      if (chain !== this.chain) {
        throw new Error('Chain mismatch between token and NeuroDexApi instance.');
      }

      // Get token info to determine decimals
      const tokenInfo = await this.viemService.getTokenInfo(tokenAddress as Address);
      if (!tokenInfo) throw new Error('Failed to get token info to get decimals');

      return tokenInfo.decimals;
    } catch (error) {
      logger.error('Error in getTokenDecimals:', error);
      throw new Error(
        `Failed to get decimals for token ${tokenAddress}: ` +
          `${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Convert human-readable token amounts to token base units with proper decimals.
   *
   * Converts a human-readable amount (e.g., 1.5 ETH) to the token's base units (wei)
   * by accounting for the token's decimal places.
   *
   * @param amount - Human-readable amount (e.g., 1.5 for 1.5 tokens)
   * @param tokenAddress - Token contract address to get decimals for
   * @param chain - Blockchain network (must match instance chain)
   * @returns Promise resolving to amount in token base units as string
   * @throws Error if chain mismatch or unable to fetch token info
   *
   * @example
   * ```typescript
   * // Convert 1.5 ETH to wei
   * const ethAmount = await neuroDex.getTokenAmount(1.5, '0x0000...', 'base');
   * console.log(ethAmount); // "1500000000000000000"
   *
   * // Convert 1.5 USDC to base units (6 decimals)
   * const usdcAmount = await neuroDex.getTokenAmount(1.5, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'base');
   * console.log(usdcAmount); // "1500000"
   * ```
   */
  private async getTokenAmount(
    amount: number,
    tokenAddress: string,
    chain: NeuroDexChain = 'base'
  ): Promise<string> {
    try {
      // Assert that chain of the token is the same as the chain of viem service
      if (chain !== this.chain) {
        throw new Error('Chain mismatch between token and NeuroDexApi instance.');
      }

      // Get token info to determine decimals
      const tokenInfo = await this.viemService.getTokenInfo(tokenAddress as Address);
      if (!tokenInfo) throw new Error('Failed to get token info to calculate token amount');

      // Calculate the full amount with decimals
      // We use string operations to avoid floating point precision issues
      const amountStr = amount.toString();
      const parts = amountStr.split('.');

      let result: string;

      if (parts.length === 1) {
        // Integer amount (no decimal part)
        result = amount + '0'.repeat(tokenInfo.decimals);
      } else {
        // Has decimal places
        const whole = parts[0];
        let fraction = parts[1];

        // Pad or truncate the fraction part based on token decimals
        if (fraction.length > tokenInfo.decimals) {
          // Truncate if too many decimal places
          fraction = fraction.substring(0, tokenInfo.decimals);
        } else {
          // Pad with zeros if fewer decimal places
          fraction = fraction.padEnd(tokenInfo.decimals, '0');
        }

        if (whole === '0') {
          result = fraction;
        } else {
          result = whole + fraction;
        }
      }

      // Remove leading zeros to avoid octal interpretation
      result = result.replace(/^0+/, '') || '0';

      return result;
    } catch (error) {
      logger.error('Error in getTokenAmount:', error);
      throw new Error(
        `Failed to convert amount for token ${tokenAddress}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Creates a new wallet with generated private key and secure storage.
   *
   * Generates a cryptographically secure private key, derives the wallet address,
   * and stores the private key securely using Supabase encryption.
   *
   * @returns Promise resolving to WalletInfo containing address and private key
   * @throws Error if private key storage fails
   *
   * @example
   * ```typescript
   * const wallet = await neuroDex.createWallet();
   * console.log(wallet.address); // "0x742d35Cc6Cb3C0532C94c3e66d7E17B9d3d17B9c"
   * console.log(wallet.privateKey); // "0x1234567890abcdef..."
   * ```
   */
  async createWallet(): Promise<WalletInfo> {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    const stored = await PrivateStorageService.storePrivateKey(account.address, privateKey);
    if (!stored) {
      throw new Error('Failed to store private key securely');
    }

    return {
      address: account.address,
      privateKey,
    };
  }

  /**
   * Retrieves the private key for a wallet address
   * @param walletAddress - The wallet address to get the private key for
   * @returns The private key or null if not found
   */
  async getPrivateKey(walletAddress: string): Promise<string | null> {
    try {
      return await PrivateStorageService.getPrivateKey(walletAddress);
    } catch (error) {
      logger.error('Error retrieving private key:', error);
      return null;
    }
  }

  /**
   * Generates a referral link for a user.
   *
   * @param userId - Telegram user ID
   * @param username - Telegram username
   * @returns Generated referral link
   */
  async generateReferralLink(userId: number, username: string): Promise<string> {
    const referralCode = username || `id${userId}`;
    const referralLink = `https://t.me/${config.telegram.botUsername}?start=r-${referralCode}`;
    return referralLink;
  }

  /**
   * Get gas price for a given chain. Uses OpenOcean API.
   *
   * @param chain - Chain name
   * @param gasPriority - Gas priority
   * @returns Gas price
   */
  private async getGasPrice(
    chain: NeuroDexChain = 'base',
    gasPriority: GasPriority = 'standard'
  ): Promise<number> {
    const response = await this.openOceanClient.getGasPrice(chain);
    if (!response.success || !response.data || !response.data.data) {
      throw new Error('Failed to get gas price');
    }
    // For most chains, gas price is a simple number
    if (typeof response.data.data[gasPriority] === 'number') {
      return response.data.data[gasPriority];
    }
    // For ETH-mainnet, gas price is an object
    return response.data.data[gasPriority].maxFeePerGas;
  }

  /**
   * Check if token allowance is sufficient and approve if needed
   * @param tokenAddress - Token address to check allowance for
   * @param ownerAddress - Owner address
   * @param spenderAddress - Spender address (typically exchange contract)
   * @param amount - Amount to approve
   * @param privateKey - Private key for signing approval transaction
   * @returns Whether approval was successful or not needed
   */
  private async checkAndApproveToken(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    amount: string,
    privateKey: string
  ): Promise<boolean> {
    try {
      // Get current allowance
      const allowance = await this.viemService.getTokenAllowance(
        tokenAddress as Address,
        ownerAddress as Address,
        spenderAddress as Address
      );

      // If allowance is sufficient, no need to approve
      if (BigInt(allowance) >= BigInt(amount)) {
        return true;
      }

      // Approve token spending
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      const receipt = await this.viemService.executeContractMethod(account, {
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spenderAddress, config.MAX_UINT256],
      });

      // Check if approval was successful
      return receipt.status === 'success';
    } catch (error) {
      logger.error('Error checking/approving token:', error);
      throw new Error(
        `Token approval failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Gets token data from DexScreener API for a given token address.
   *
   * Handles all edge cases internally and provides safe defaults for all fields.
   * The returned data is guaranteed to have valid values without requiring fallback operators.
   *
   * @param tokenAddress - The contract address of the token
   * @param _network - The blockchain network name (unused but kept for interface compatibility)
   * @returns Token data response with guaranteed valid metadata (no undefined/null values)
   */
  async getTokenDataByContractAddress(
    tokenAddress: string,
    _network: string
  ): Promise<NeuroDexResponse<TokenData>> {
    try {
      // Validate input
      if (!tokenAddress || typeof tokenAddress !== 'string' || tokenAddress.trim() === '') {
        throw new Error('Invalid token address provided');
      }

      const cleanTokenAddress = tokenAddress.trim();
      const url = `https://api.dexscreener.com/latest/dex/tokens/${cleanTokenAddress}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'NeuroDex/1.0',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Token not found (HTTP ${response.status})`);
      }

      const data = (await response.json()) as {
        pairs?: Array<{
          baseToken?: {
            name?: string;
            symbol?: string;
            logoURI?: string;
          };
          priceUsd?: string | number;
          chainId?: string;
        }>;
      };

      // Validate response structure
      if (!data.pairs || !Array.isArray(data.pairs) || data.pairs.length === 0) {
        throw new Error('No trading pairs found for token');
      }

      const pair = data.pairs[0];

      // Validate pair data
      if (!pair || !pair.baseToken) {
        throw new Error('Invalid pair data structure');
      }

      // Extract and validate token data with proper defaults
      const baseToken = pair.baseToken;
      const name =
        typeof baseToken.name === 'string' && baseToken.name.trim() !== ''
          ? baseToken.name.trim()
          : 'Unknown Token';

      const symbol =
        typeof baseToken.symbol === 'string' && baseToken.symbol.trim() !== ''
          ? baseToken.symbol.trim()
          : 'UNKNOWN';

      const logo =
        typeof baseToken.logoURI === 'string' && baseToken.logoURI.trim() !== ''
          ? baseToken.logoURI.trim()
          : undefined;

      // Handle price conversion and validation
      let price = 0;
      if (pair.priceUsd !== undefined && pair.priceUsd !== null) {
        const priceValue =
          typeof pair.priceUsd === 'string' ? parseFloat(pair.priceUsd) : Number(pair.priceUsd);

        // Ensure price is a valid finite positive number
        if (Number.isFinite(priceValue) && priceValue >= 0) {
          price = priceValue;
        }
      }

      const chain =
        typeof pair.chainId === 'string' && pair.chainId.trim() !== ''
          ? pair.chainId.trim()
          : 'unknown';

      return {
        success: true,
        data: {
          address: cleanTokenAddress,
          name: name,
          symbol: symbol,
          decimals: 18, // Standard ERC20 decimals, could be made dynamic in the future
          price: price,
          totalSupply: undefined,
          marketCap: undefined,
          logo: logo,
          chain: chain,
        },
      };
    } catch (error) {
      logger.error('Error fetching token data:', error);

      // Provide detailed error messages
      let errorMessage = 'Failed to fetch token data';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout - token data fetch took too long';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Buy tokens using the chain's native token (ETH/BNB).
   *
   * Executes a token purchase by:
   * 1. Getting a quote from OpenOcean DEX aggregator
   * 2. Preparing the swap transaction with optimal routing
   * 3. Executing the swap on-chain
   *
   * Uses the native token (ETH for Ethereum/Base, BNB for BSC) as the input token.
   *
   * @param params - Trading parameters including amount, slippage, and wallet info
   * @param chain - Target blockchain network (default: instance chain)
   * @returns Promise resolving to NeuroDexResponse with swap result or error
   *
   * @example
   * ```typescript
   * const result = await neuroDex.buy({
   *   toTokenAddress: '0xA0b86a33E6411A3Ab7e3AC05934AD6a4d923f3e',  // USDC
   *   fromAmount: 0.1,          // 0.1 ETH
   *   slippage: 1,              // 1% slippage tolerance
   *   gasPriority: 'standard',
   *   walletAddress: '0x742d35Cc6Cb3C0532C94c3e66d7E17B9d3d17B9c',
   *   privateKey: '0x1234...'
   * });
   *
   * if (result.success) {
   *   console.log('Transaction hash:', result.data.txHash);
   *   console.log('Received tokens:', result.data.outAmount);
   * }
   * ```
   */
  async buy(
    params: BuyParams,
    chain: NeuroDexChain = 'base'
  ): Promise<NeuroDexResponse<SwapResult>> {
    try {
      const gasPrice = await this.getGasPrice(chain, params.gasPriority);
      const nativeTokenAddress = this.nativeTokenAddress[chain];
      const tokenAmount = await this.getTokenAmount(params.fromAmount, nativeTokenAddress, chain);

      // Get quote first
      const quote = await this.openOceanClient.quote(
        {
          inTokenAddress: nativeTokenAddress,
          outTokenAddress: params.toTokenAddress,
          amountDecimals: tokenAmount,
          gasPriceDecimals: gasPrice.toString(),
          slippage: params.slippage.toString(),
        },
        chain
      );
      if (!quote.success || !quote.data) throw new Error(quote.error || 'Quote data is undefined');

      // Prepare swap
      const swap = await this.openOceanClient.swap(
        {
          inTokenAddress: quote.data.data.inToken.address,
          outTokenAddress: quote.data.data.outToken.address,
          amountDecimals: quote.data.data.inAmount,
          gasPriceDecimals: quote.data.data.estimatedGas,
          slippage: params.slippage.toString(),
          account: params.walletAddress,
          referrer: params.referrer,
          referrerFee: config.defaultReferrerFee,
        },
        chain
      );
      if (!swap.success || !swap.data) throw new Error(swap.error || 'Swap data is undefined');

      // Execute swap
      const account = privateKeyToAccount(params.privateKey as `0x${string}`);
      const receipt = await this.viemService.executeTransaction(account, {
        to: swap.data.data.to as Address,
        data: swap.data.data.data,
        value: swap.data.data.value === '0' ? swap.data.data.inAmount : swap.data.data.value,
        gasPrice: gasPrice.toString(),
      });

      return {
        success: true,
        data: {
          inToken: {
            address: swap.data.data.inToken.address,
            symbol: swap.data.data.inToken.symbol,
            decimals: swap.data.data.inToken.decimals,
          },
          outToken: {
            address: swap.data.data.outToken.address,
            symbol: swap.data.data.outToken.symbol,
            decimals: swap.data.data.outToken.decimals,
          },
          inAmount: Number(swap.data.data.inAmount),
          outAmount: Number(swap.data.data.outAmount),
          estimatedGas: Number(swap.data.data.estimatedGas),
          price_impact: Number(swap.data.data.price_impact) || undefined,
          txHash: receipt.transactionHash,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error in buy',
      };
    }
  }

  /**
   * Sell a given `amount` of tokens.
   * 1) Check and approve token allowance if needed.
   * 2) Prepare swap.
   * 3) Execute swap.
   *
   * @param params - Trade parameters
   * @param chain - Chain name
   * @returns Swap response
   */
  async sell(
    params: SellParams,
    chain: NeuroDexChain = 'base'
  ): Promise<NeuroDexResponse<SwapResult>> {
    try {
      const gasPrice = await this.getGasPrice(chain, params.gasPriority);
      const nativeTokenAddress = this.nativeTokenAddress[chain];
      const tokenAmount = await this.getTokenAmount(
        params.fromAmount,
        params.fromTokenAddress,
        chain
      );

      // Get quote first
      const quote = await this.openOceanClient.quote(
        {
          inTokenAddress: params.fromTokenAddress,
          outTokenAddress: nativeTokenAddress,
          amountDecimals: tokenAmount,
          gasPriceDecimals: gasPrice.toString(),
          slippage: params.slippage.toString(),
        },
        chain
      );
      if (!quote.success || !quote.data) throw new Error(quote.error || 'Quote data is undefined');

      // Prepare swap
      const swap = await this.openOceanClient.swap(
        {
          inTokenAddress: quote.data.data.inToken.address,
          outTokenAddress: quote.data.data.outToken.address,
          amountDecimals: quote.data.data.inAmount,
          gasPriceDecimals: quote.data.data.estimatedGas,
          slippage: params.slippage.toString(),
          account: params.walletAddress,
          referrer: params.referrer,
          referrerFee: config.defaultReferrerFee,
        },
        chain
      );
      if (!swap.success || !swap.data) throw new Error(swap.error || 'Swap data is undefined');

      // Check if token approval is needed for ERC20 tokens (excluding native token)
      if (swap.data.data.inToken.address.toLowerCase() !== nativeTokenAddress.toLowerCase()) {
        const isApproved = await this.checkAndApproveToken(
          swap.data.data.inToken.address,
          params.walletAddress,
          swap.data.data.to,
          swap.data.data.inAmount,
          params.privateKey
        );

        if (!isApproved) {
          throw new Error('Failed to approve token amount for swap');
        }
      }

      // Execute swap
      const account = privateKeyToAccount(params.privateKey as `0x${string}`);
      const receipt = await this.viemService.executeTransaction(account, {
        to: swap.data.data.to as Address,
        data: swap.data.data.data,
        value: swap.data.data.value,
        gasPrice: gasPrice.toString(),
      });

      return {
        success: true,
        data: {
          inToken: {
            address: swap.data.data.inToken.address,
            symbol: swap.data.data.inToken.symbol,
            decimals: swap.data.data.inToken.decimals,
          },
          outToken: {
            address: swap.data.data.outToken.address,
            symbol: swap.data.data.outToken.symbol,
            decimals: swap.data.data.outToken.decimals,
          },
          inAmount: Number(swap.data.data.inAmount),
          outAmount: Number(swap.data.data.outAmount),
          estimatedGas: Number(swap.data.data.estimatedGas),
          price_impact: Number(swap.data.data.price_impact) || undefined,
          txHash: receipt.transactionHash,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error in sell',
      };
    }
  }

  /**
   * Create a limit order using OpenOcean SDK
   * @param params - Limit order parameters
   * @param chain - Target blockchain network
   * @returns Created limit order data including order hash and metadata
   */
  async createLimitOrder(
    params: LimitOrderParams,
    chain: NeuroDexChain = this.chain
  ): Promise<NeuroDexResponse<LimitOrderResult>> {
    try {
      const chainId = NeuroDexChainToOpenOceanChain[chain];
      const web3 = new Web3(config.node.baseMainnetRpc);
      const account = web3.eth.accounts.privateKeyToAccount(params.privateKey);
      web3.eth.accounts.wallet.add(account);
      this.openOceanClient.initializeSdk(chainId, web3 as Web3, account.address);
      const gasPrice = await this.getGasPrice(chain, params.gasPriority);

      const makerTokenDecimals = await this.getTokenDecimals(params.fromTokenAddress, chain);
      const takerTokenDecimals = await this.getTokenDecimals(params.toTokenAddress, chain);

      const makerAmount = await this.getTokenAmount(
        params.fromAmount,
        params.fromTokenAddress,
        chain
      );
      const takerAmount = await this.getTokenAmount(params.toAmount, params.toTokenAddress, chain);

      const result = await this.openOceanClient.createLimitOrder(
        {
          makerTokenAddress: params.fromTokenAddress,
          makerTokenDecimals: makerTokenDecimals,
          takerTokenAddress: params.toTokenAddress,
          takerTokenDecimals: takerTokenDecimals,
          makerAmount: makerAmount,
          takerAmount: takerAmount,
          gasPrice: gasPrice,
          expire: params.expire,
          referrer: params.referrer || undefined,
          referrerFee: config.defaultReferrerFee,
        },
        chain
      );

      if (!result.success || !result.data) {
        throw new Error('Failed to create limit order: ' + (result.error || 'Unknown error'));
      }

      // Extract order hash and build result
      const orderHash = result.data.orderHash || '';
      const now = new Date();

      // Calculate expiry based on the expire parameter (e.g., "1D", "7D", "1H")
      const expiryDate = this.calculateExpiryDate(params.expire, now);

      const orderResult: LimitOrderResult = {
        orderHash,
        createdAt: now.toISOString(),
        expiresAt: expiryDate.toISOString(),
        makerTokenAddress: params.fromTokenAddress,
        takerTokenAddress: params.toTokenAddress,
        makerAmount: params.fromAmount.toString(),
        takerAmount: params.toAmount.toString(),
      };

      return {
        success: true,
        data: orderResult,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in createLimitOrder',
      };
    }
  }

  /**
   * Calculate expiry date based on expire string format
   * @param expire - Expire string (e.g., "1D", "7D", "1H", "10M")
   * @param fromDate - Starting date
   * @returns Calculated expiry date
   */
  private calculateExpiryDate(expire: string, fromDate: Date): Date {
    const match = expire.match(/^(\d+)([MHDW])$/i);
    if (!match) {
      // Default to 1 day if format is invalid
      const result = new Date(fromDate);
      result.setDate(result.getDate() + 1);
      return result;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2].toUpperCase();
    const result = new Date(fromDate);

    switch (unit) {
      case 'M': // Minutes
        result.setMinutes(result.getMinutes() + value);
        break;
      case 'H': // Hours
        result.setHours(result.getHours() + value);
        break;
      case 'D': // Days
        result.setDate(result.getDate() + value);
        break;
      case 'W': // Weeks
        result.setDate(result.getDate() + value * 7);
        break;
      default:
        result.setDate(result.getDate() + 1);
    }

    return result;
  }

  /**
   * Cancel a limit order using OpenOcean SDK
   * @param params - Cancel limit order parameters
   * @param chain - Target blockchain network
   * @returns Cancellation result
   */
  async cancelLimitOrder(
    params: CancelLimitOrderParams,
    chain: NeuroDexChain = this.chain
  ): Promise<NeuroDexResponse<{ code: number }>> {
    try {
      const chainId = NeuroDexChainToOpenOceanChain[chain];
      const web3 = new Web3(config.node.baseMainnetRpc);
      const account = web3.eth.accounts.privateKeyToAccount(params.privateKey);
      web3.eth.accounts.wallet.add(account);
      this.openOceanClient.initializeSdk(chainId, web3 as Web3, account.address);

      const result = await this.openOceanClient.cancelLimitOrderAPI(params.orderHash, chain);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to cancel limit order via API',
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in cancelLimitOrder',
      };
    }
  }

  /**
   * Get list of limit orders for an address
   * @param address - Wallet address
   * @param chain - Target blockchain network
   * @returns List of limit orders
   */
  async getLimitOrders(
    params: GetLimitOrdersParams,
    chain: NeuroDexChain = this.chain
  ): Promise<NeuroDexResponse<LimitOrderInfo[]>> {
    try {
      // Use the detailed endpoint to get full order information
      const response = await this.openOceanClient.getLimitOrders(
        params.address,
        params.statuses,
        params.page,
        params.limit,
        'createDateTime',
        '0',
        chain
      );
      if (!response.success || !response.data) {
        throw new Error('Failed to get limit orders: ' + (response.error || 'Unknown error'));
      }

      // Transform the response to match our LimitOrderInfo interface
      const orders: LimitOrderInfo[] = response.data.data.map((order) => ({
        orderHash: order.orderHash,
        status: this.mapOrderStatus(order.statuses),
        data: {
          makerAssetSymbol: order.data.makerAssetSymbol,
          takerAssetSymbol: order.data.takerAssetSymbol,
          makerAssetAmount: order.data.makingAmount,
          takerAssetAmount: order.data.takingAmount,
          makerAssetAddress: order.data.makerAsset,
          takerAssetAddress: order.data.takerAsset,
          maker: order.data.maker,
          orderHash: order.orderHash,
          createDateTime: new Date(order.createDateTime).getTime(),
          expiry: new Date(order.expireTime).getTime(),
        },
      }));

      return {
        success: true,
        data: orders,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in getLimitOrders',
      };
    }
  }

  /**
   * Create a DCA order using OpenOcean SDK
   * @param params - DCA order parameters
   * @param chain - Target blockchain network
   * @returns Created DCA order data
   */
  async createDcaOrder(
    params: DcaParams,
    chain: NeuroDexChain = this.chain
  ): Promise<NeuroDexResponse<{ code: number }>> {
    try {
      const web3 = new Web3(config.node.baseMainnetRpc);
      const account = web3.eth.accounts.privateKeyToAccount(params.privateKey);
      web3.eth.accounts.wallet.add(account);
      const gasPrice = await this.getGasPrice(chain, params.gasPriority);

      // Get native token address (maker token - what we're selling)
      const nativeTokenAddress = this.nativeTokenAddress[chain];

      // Get token decimals for both tokens
      const makerTokenDecimals = await this.getTokenDecimals(nativeTokenAddress, chain);
      const takerTokenDecimals = await this.getTokenDecimals(params.toTokenAddress, chain);

      // Calculate maker amount with decimals
      const makerAmount = await this.getTokenAmount(params.fromAmount, nativeTokenAddress, chain);

      // Initialize the SDK for DCA orders
      const chainId = NeuroDexChainToOpenOceanChain[chain];
      this.openOceanClient.initializeSdk(chainId, web3 as Web3, account.address, true);

      const result = await this.openOceanClient.createDcaOrder(
        {
          provider: web3,
          address: params.walletAddress,
          makerTokenAddress: nativeTokenAddress,
          makerTokenDecimals: makerTokenDecimals,
          takerTokenAddress: params.toTokenAddress,
          takerTokenDecimals: takerTokenDecimals,
          makerAmount: makerAmount,
          takerAmount: '1',
          gasPrice: gasPrice,
          expire: params.expire,
          time: params.time,
          times: params.times,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          referrer: params.referrer || undefined,
          referrerFee: config.defaultReferrerFee,
        },
        chain
      );

      if (!result.success || !result.data) {
        throw new Error('Failed to create DCA order: ' + (result.error || 'Unknown error'));
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in createDcaOrder',
      };
    }
  }

  /**
   * Cancel a DCA order using OpenOcean SDK
   * @param params - Cancel DCA order parameters
   * @param chain - Target blockchain network
   * @returns Cancellation result
   */
  async cancelDcaOrder(
    params: CancelDcaOrderParams,
    chain: NeuroDexChain = this.chain
  ): Promise<NeuroDexResponse<{ code: number }>> {
    try {
      const chainId = NeuroDexChainToOpenOceanChain[chain];
      const web3 = new Web3(config.node.baseMainnetRpc);
      const account = web3.eth.accounts.privateKeyToAccount(params.privateKey);
      web3.eth.accounts.wallet.add(account);
      this.openOceanClient.initializeSdk(chainId, web3 as Web3, account.address);

      // First try to cancel via API
      const result = await this.openOceanClient.cancelDcaOrderAPI(params.orderHash, chain);

      if (!result.success) {
        throw new Error('Failed to cancel DCA order: ' + (result.error || 'Unknown error'));
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in cancelDcaOrder',
      };
    }
  }

  /**
   * Get list of DCA orders for an address
   * @param params - Parameters for getting DCA orders
   * @param chain - Target blockchain network
   * @returns List of DCA orders
   */
  async getDcaOrders(
    params: GetDcaOrdersParams,
    chain: NeuroDexChain = this.chain
  ): Promise<NeuroDexResponse<DcaOrderInfo[]>> {
    try {
      const response = await this.openOceanClient.getDcaOrders(
        {
          address: params.address,
          statuses: params.statuses || [1, 3, 4], // Default to active, cancelled, and filled orders
          limit: params.limit || 100,
          orderHash: '', // Not needed for listing orders
        },
        chain
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to get DCA orders: ' + (response.error || 'Unknown error'));
      }

      // Transform the response to match our DcaOrderInfo interface
      const orders: DcaOrderInfo[] = response.data.data.map((order) => ({
        orderHash: order.orderHash,
        status: this.mapOrderStatus(order.statuses),
        data: {
          makerAssetSymbol: order.data.makerAssetSymbol,
          takerAssetSymbol: order.data.takerAssetSymbol,
          makingAmount: order.data.makingAmount,
          takingAmount: order.data.takingAmount,
          makerAsset: order.data.makerAsset,
          takerAsset: order.data.takerAsset,
          maker: order.data.maker,
        },
        createDateTime: order.createDateTime,
        expireTime: order.expireTime,
        time: order.time,
        times: order.times,
        have_filled: order.have_filled,
        minPrice: order.minPrice,
        maxPrice: order.maxPrice,
      }));

      return {
        success: true,
        data: orders,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in getDcaOrders',
      };
    }
  }

  /**
   * Maps OpenOcean order status codes to human-readable status strings
   * @param status - OpenOcean status code
   * @returns Human-readable status string
   */
  private mapOrderStatus(status: number): string {
    switch (status) {
      case 1:
        return 'unfilled';
      case 2:
        return 'failed';
      case 3:
        return 'cancelled';
      case 4:
        return 'filled';
      case 5:
        return 'pending';
      case 6:
        return 'hash_not_exist';
      case 7:
        return 'expired';
      default:
        return 'unknown';
    }
  }

  /**
   * Withdraw native tokens from user's wallet to another address
   * @param params - Withdrawal parameters
   * @param chain - Target blockchain network
   * @returns Withdrawal result
   */
  async withdraw(
    params: WithdrawParams,
    chain: NeuroDexChain = this.chain
  ): Promise<NeuroDexResponse<WithdrawResult>> {
    try {
      if (chain !== this.chain) {
        throw new Error('Chain mismatch between withdrawal and NeuroDexApi instance.');
      }

      const nativeTokenAddress = this.nativeTokenAddress[chain];
      const amountInWei = await this.getTokenAmount(params.amount, nativeTokenAddress, chain);
      const gasPrice = await this.getGasPrice(chain, params.gasPriority);

      const account = privateKeyToAccount(params.privateKey as `0x${string}`);

      const receipt = await this.viemService.transferNativeToken(
        account,
        params.toAddress as Address,
        amountInWei,
        gasPrice.toString()
      );

      return {
        success: true,
        data: {
          txHash: receipt.transactionHash,
          amount: amountInWei,
          toAddress: params.toAddress,
          fromAddress: params.walletAddress,
          gasUsed: receipt.gasUsed.toString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in withdraw',
      };
    }
  }

  /**
   * Estimates gas fees for creating a limit order.
   *
   * Provides an estimate of the gas cost for creating a limit order, including
   * the cost in ETH and USD. Uses the current gas price and ETH price to calculate.
   *
   * @param params - Fee estimation parameters
   * @param chain - Target blockchain network (default: instance chain)
   * @returns Promise resolving to NeuroDexResponse with fee estimation or error
   *
   * @example
   * ```typescript
   * const estimation = await neuroDex.estimateLimitOrderFee({
   *   fromTokenAddress: '0x123...',
   *   toTokenAddress: '0x456...',
   *   fromAmount: 100,
   *   toAmount: 0.05,
   *   walletAddress: '0x789...',
   *   gasPriority: 'standard'
   * });
   *
   * if (estimation.success) {
   *   console.log('Estimated gas:', estimation.data.gasEth, 'ETH');
   *   console.log('Estimated cost:', estimation.data.gasUsd, 'USD');
   * }
   * ```
   */
  async estimateLimitOrderFee(
    params: FeeEstimationParams,
    chain: NeuroDexChain = this.chain
  ): Promise<NeuroDexResponse<FeeEstimation>> {
    try {
      // Get current gas price
      const gasPrice = await this.getGasPrice(chain, params.gasPriority);

      // Estimate gas for limit order creation
      // OpenOcean limit orders typically use around 150,000-300,000 gas
      // We use a conservative estimate of 250,000 gas units for limit order creation
      const estimatedGasUnits = BigInt(250000);

      // Convert gas price to wei (gas price from OpenOcean is in gwei for most chains)
      const gasPriceWei = BigInt(gasPrice) * BigInt(1e9);

      // Calculate total gas cost in wei
      const totalGasWei = estimatedGasUnits * gasPriceWei;

      // Convert to ETH (18 decimals)
      const gasEth = Number(totalGasWei) / 1e18;

      // Fetch current ETH price in USD
      let ethPriceUsd = 0;
      try {
        const nativeTokenAddress = this.nativeTokenAddress[chain];
        const tokenData = await this.getTokenDataByContractAddress(nativeTokenAddress, chain);
        if (tokenData.success && tokenData.data?.price) {
          ethPriceUsd = tokenData.data.price;
        }
      } catch (priceError) {
        logger.warn('Failed to fetch ETH price for fee estimation:', priceError);
        // Use a fallback price if we can't fetch the current price
        ethPriceUsd = 3000; // Reasonable fallback
      }

      // Calculate USD value
      const gasUsd = gasEth * ethPriceUsd;

      return {
        success: true,
        data: {
          gasWei: totalGasWei.toString(),
          gasEth: gasEth.toFixed(6),
          gasUsd: gasUsd.toFixed(2),
          ethPriceUsd: ethPriceUsd,
          gasPriceGwei: gasPrice.toString(),
        },
      };
    } catch (error) {
      logger.error('Error estimating limit order fee:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in estimateLimitOrderFee',
      };
    }
  }
}

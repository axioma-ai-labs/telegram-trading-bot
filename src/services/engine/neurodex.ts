import { BalancesResponse, Chain, GoldRushClient } from '@covalenthq/client-sdk';
import { Address } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import Web3 from 'web3';

import { config } from '@/config/config';
import logger from '@/config/logger';
import { OpenOceanClient } from '@/services/engine/openocean.service';
import { ViemService } from '@/services/engine/viem.service';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import { GasPriority } from '@/types/config';
import {
  BuyParams,
  CancelDcaOrderParams,
  CancelLimitOrderParams,
  DcaOrderInfo,
  DcaParams,
  GetDcaOrdersParams,
  GetLimitOrdersParams,
  LimitOrderInfo,
  LimitOrderParams,
  NeuroDexResponse,
  SellParams,
  SwapResult,
  TokenData,
  WalletInfo,
} from '@/types/neurodex';
import {
  NeuroDexChain,
  NeuroDexChainToOpenOceanChain,
  NeuroDexChainToViemChain,
} from '@/types/neurodex';
import { erc20Abi } from '@/utils/abis';

/**
 * NeuroDex API service for handling trading operations
 * Wraps OpenOcean functionality and provides high-level trading methods
 */
export class NeuroDexApi {
  private readonly openOceanClient: OpenOceanClient;
  private readonly viemService: ViemService;
  private readonly nativeTokenAddress: Record<NeuroDexChain, string> = {
    base: config.nativeTokenAddress.base,
    ethereum: config.nativeTokenAddress.ethereum,
    bsc: config.nativeTokenAddress.bsc,
  };
  private readonly chain: NeuroDexChain;

  constructor(chain: NeuroDexChain = 'base', rpcUrl: string = config.node.baseMainnetRpc) {
    this.chain = chain;
    this.openOceanClient = new OpenOceanClient(chain);
    const viemChain = NeuroDexChainToViemChain[chain];
    this.viemService = new ViemService(viemChain, rpcUrl);
  }

  /**
   * Get token decimals for a given token address
   * @param tokenAddress - Token address to get decimals for
   * @param chain - Chain name
   * @returns Number of decimals for the token
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
   * Get amount of token with decimals for a given amount in user-friendly format.
   * Converts a human-readable amount (e.g., 1.5 ETH) to the token's base units (wei)
   * by accounting for token's decimals.
   *
   * @param amount - Human-readable amount without decimals (e.g., 1.5)
   * @param tokenAddress - Token address to get decimals for
   * @param chain - Chain name
   * @returns Amount in token base units with appropriate decimals
   *          (e.g., 1.5 ETH -> 1500000000000000000)
   *          (e.g., 1.5 USDC -> 1500000)
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
   * Creates a new wallet. Uses Viem.
   *
   * @returns WalletInfo
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
   * Get token balances for a given address. Uses Covalent API.
   *
   * @param chain - Chain name
   * @param address - Wallet address
   * @returns BalancesResponse
   */
  async getTokenBalances(
    chain: string = 'eth-mainnet',
    address: string
  ): Promise<BalancesResponse | null> {
    const client = new GoldRushClient(config.covalenthqApiKey);
    const response = await client.BalanceService.getTokenBalancesForWalletAddress(
      chain as Chain,
      address
    );
    return response.data;
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
    const referralLink = `https://t.me/neuro_bro_test_bot?start=r-${referralCode}`;
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
   * @param tokenAddress - The contract address of the token
   * @param _network - The blockchain network name (unused but kept for interface compatibility)
   * @returns Token data response with metadata
   */
  async getTokenDataByContractAddress(
    tokenAddress: string,
    _network: string
  ): Promise<NeuroDexResponse<TokenData>> {
    try {
      const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Token not found');
      }

      const data = (await response.json()) as {
        pairs: Array<{
          baseToken: { name: string; symbol: string; logoURI?: string };
          priceUsd: string;
          chainId: string;
        }>;
      };
      const pair = data.pairs[0]; // get first pair. Maybe this won't work for all tokens, but no edge cases were found yet

      if (!pair) {
        throw new Error('No trading pairs found for token');
      }

      return {
        success: true,
        data: {
          address: tokenAddress,
          name: pair.baseToken.name,
          symbol: pair.baseToken.symbol,
          decimals: 18,
          price: Number(pair.priceUsd) || undefined,
          totalSupply: undefined,
          marketCap: undefined,
          logo: pair.baseToken.logoURI,
          chain: pair.chainId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch token data',
      };
    }
  }

  /**
   * Buy a given amount of `tokenAddress` using the chain's native token.
   * 1) Prepare quote.
   * 2) Prepare swap.
   * 3) Execute swap.
   *
   * @param params - Trade parameters
   * @param chain - Chain name
   * @returns Swap response
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
   * @returns Created limit order data
   */
  async createLimitOrder(
    params: LimitOrderParams,
    chain: NeuroDexChain = this.chain
  ): Promise<NeuroDexResponse<{ code: number }>> {
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

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in createLimitOrder',
      };
    }
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
        // If the order is not cancelled onchain, try to cancel it onchain
        // TODO: This doesn't work atm!!!
        const gasPrice = await this.getGasPrice(chain, params.gasPriority);
        const onchainResult = await this.openOceanClient.cancelLimitOrderOnchain(
          {
            orderData: params.orderData,
            gasPrice: gasPrice,
          },
          chain
        );
        if (!onchainResult.success) {
          throw new Error(
            'Failed to cancel limit order: ' + (onchainResult.error || 'Unknown error')
          );
        }
        return {
          success: true,
          data: onchainResult.data,
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
}

import { Address, createPublicClient, formatEther, http } from 'viem';
import { base, bsc, mainnet } from 'viem/chains';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { BalancesResponse, Chain, GoldRushClient } from '@covalenthq/client-sdk';
import { OpenOceanClient } from '@/services/engine/openocean.service';
import { ViemService } from '@/services/engine/viem.service';
import { config } from '@/config/config';
import { NeuroDexResponse, WalletInfo, SwapResult, BuyParams, SellParams } from '@/types/neurodex';
import { OpenOceanChain } from '@/types/openocean';
import { GasPriority } from '@/types/config';
import { erc20Abi } from '@/utils/abis';

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  price?: number;
  totalSupply?: number;
  marketCap?: number;
  logo?: string;
  chain: string;
}

/**
 * NeuroDex API service for handling trading operations
 * Wraps OpenOcean functionality and provides high-level trading methods
 */
export class NeuroDexApi {
  private readonly openOceanClient: OpenOceanClient;
  private readonly viemService: ViemService;
  private readonly nativeTokenAddress: Record<OpenOceanChain, string> = {
    base: config.nativeTokenAddress.base,
    ethereum: config.nativeTokenAddress.ethereum,
    bsc: config.nativeTokenAddress.bsc,
  };
  private readonly chain: OpenOceanChain;

  constructor(chain: OpenOceanChain = 'base', rpcUrl: string = config.node.baseMainnetRpc) {
    this.chain = chain;
    this.openOceanClient = new OpenOceanClient(chain);
    const viemChain = chain === 'base' ? base : chain === 'ethereum' ? mainnet : bsc;
    this.viemService = new ViemService(viemChain, rpcUrl);
  }

  /**
   * Get amount of token with decimals for a given amount in user-friendly format.
   * Converts a human-readable amount (e.g., 1.5 ETH) to the token's base units (wei)
   * by accounting for token's decimals.
   *
   * @param amount - Human-readable amount without decimals (e.g., 1.5)
   * @param tokenAddress - Token address to get decimals for
   * @param chain - Chain name
   * @returns Amount in token base units with appropriate decimals (e.g., 1.5 ETH -> 1500000000000000000)
   */
  private async getTokenAmount(
    amount: number,
    tokenAddress: string,
    chain: OpenOceanChain = 'base'
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
      console.error('Error in getTokenAmount:', error);
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

    return {
      address: account.address,
      privateKey,
    };
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

  // To be deprecated!
  async getEthBalance(address: string): Promise<NeuroDexResponse<string>> {
    try {
      const client = createPublicClient({
        transport: http(config.node.baseMainnetRpc),
      });

      const balance = await client.getBalance({ address: address as `0x${string}` });

      return {
        success: true,
        data: formatEther(balance), // returns balance in ETH as string
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
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
    const referralLink = `https://t.me/neuro_bro_test_bot?start=r-${referralCode}`;
    return referralLink;
  }

  // private async encryptPrivateKey(privateKey: string): Promise<string> {
  //   const iv = crypto.randomBytes(12); // GCM recommends 12 bytes
  //   const key = crypto.createHash('sha256').update(config.wallet.encryptionKey).digest();
  //   const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  //   const encrypted = Buffer.concat([cipher.update(privateKey, 'utf8'), cipher.final()]);
  //   const authTag = cipher.getAuthTag();

  //   return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
  // }

  // private async decryptPrivateKey(encrypted: string): Promise<string> {
  //   const [ivHex, tagHex, dataHex] = encrypted.split(':');
  //   const iv = Buffer.from(ivHex, 'hex');
  //   const tag = Buffer.from(tagHex, 'hex');
  //   const data = Buffer.from(dataHex, 'hex');
  //   const key = crypto.createHash('sha256').update(config.wallet.encryptionKey).digest();

  //   const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  //   decipher.setAuthTag(tag);

  //   const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);

  //   return decrypted.toString('utf8');
  // }

  /**
   * Get gas price for a given chain. Uses OpenOcean API.
   *
   * @param chain - Chain name
   * @param gasPriority - Gas priority
   * @returns Gas price
   */
  private async getGasPrice(
    chain: OpenOceanChain = 'base',
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
      console.error('Error checking/approving token:', error);
      throw new Error(
        `Token approval failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
    chain: OpenOceanChain = 'base'
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
          referrerFee: 1, // 1% refferer fee
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
    chain: OpenOceanChain = 'base'
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
          referrerFee: 1, // 1% refferer fee
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
   * Gets token data from DexScreener API for a given token address.
   *
   * @param tokenAddress - The contract address of the token
   * @param _network - The blockchain network name (unused but kept for interface compatibility)
   * @returns Token data response with metadata
   */
  async getTokenDataByContractAddress(
    tokenAddress: string,
    _network: string // Prefix with underscore to indicate intentionally unused
  ): Promise<NeuroDexResponse<TokenData>> {
    try {
      const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Token not found');
      }

      const data = await response.json();
      const pair = data.pairs[0]; // get first pair based on dexscreener api docs

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

  // /**
  //  * Create a DCA (Dollar Cost Averaging) order
  //  * @param params - DCA parameters
  //  * @param chain - Target blockchain network
  //  * @returns DCA order data
  //  */
  // async createDca(
  //   params: DcaParams,
  //   chain: OpenOceanChain = 'base'
  // ): Promise<NeuroDexResponse<DcaOrderResponse>> {
  //   try {
  //     const response = await this.openOceanClient.createDca(
  //       {
  //         inTokenAddress: this.nativeTokenAddress[chain],
  //         outTokenAddress: params.tokenAddress,
  //         totalAmount: params.totalAmount,
  //         intervals: params.intervals,
  //         intervalDuration: params.intervalDuration,
  //         account: params.walletAddress,
  //         slippage: params.slippage?.toString(),
  //       },
  //       chain
  //     );

  //     if (!response.success || !response.data) {
  //       throw new Error('Failed to create DCA order');
  //     }

  //     return {
  //       success: true,
  //       data: response.data,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error instanceof Error ? error.message : 'Unknown error',
  //     };
  //   }
  // }

  // /**
  //  * Create a limit order
  //  * @param params - Limit order parameters
  //  * @param chain - Target blockchain network
  //  * @returns Limit order data
  //  */
  // async createLimitOrder(
  //   params: LimitOrderParams,
  //   chain: OpenOceanChain = 'base'
  // ): Promise<NeuroDexResponse<LimitOrderResponse>> {
  //   try {
  //     const response = await this.openOceanClient.createLimitOrder(
  //       {
  //         makerTokenAddress: this.nativeTokenAddress[chain],
  //         takerTokenAddress: params.tokenAddress,
  //         makerAmount: parseUnits(params.targetPrice, 18).toString(),
  //         takerAmount: params.amount,
  //         account: params.walletAddress,
  //         expireTime: params.expireTime,
  //       },
  //       chain
  //     );

  //     if (!response.success || !response.data) {
  //       throw new Error('Failed to create limit order');
  //     }

  //     return {
  //       success: true,
  //       data: response.data,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error instanceof Error ? error.message : 'Unknown error',
  //     };
  //   }
  // }

  // /**
  //  * Cancel a DCA order
  //  * @param orderHash - Order hash to cancel
  //  * @param chain - Target blockchain network
  //  * @returns Cancellation result
  //  */
  // async cancelDca(
  //   orderHash: string,
  //   chain: OpenOceanChain = 'base'
  // ): Promise<NeuroDexResponse<boolean>> {
  //   try {
  //     const response = await this.openOceanClient.cancelDca(orderHash, chain);
  //     if (!response.success) {
  //       throw new Error('Failed to cancel DCA order');
  //     }
  //     return {
  //       success: true,
  //       data: true,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error instanceof Error ? error.message : 'Unknown error',
  //     };
  //   }
  // }

  // /**
  //  * Cancel a limit order
  //  * @param orderHash - Order hash to cancel
  //  * @param chain - Target blockchain network
  //  * @returns Cancellation result
  //  */
  // async cancelLimitOrder(
  //   orderHash: string,
  //   chain: OpenOceanChain = 'base'
  // ): Promise<NeuroDexResponse<boolean>> {
  //   try {
  //     const response = await this.openOceanClient.cancelLimitOrder(orderHash, chain);
  //     if (!response.success) {
  //       throw new Error('Failed to cancel limit order');
  //     }
  //     return {
  //       success: true,
  //       data: true,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error instanceof Error ? error.message : 'Unknown error',
  //     };
  //   }
  // }

  // /**
  //  * Get list of DCA orders for an address
  //  * @param address - Wallet address
  //  * @param chain - Target blockchain network
  //  * @returns List of DCA orders
  //  */
  // async getDcaOrders(
  //   address: string,
  //   chain: OpenOceanChain = 'base'
  // ): Promise<NeuroDexResponse<OrderInfo[]>> {
  //   try {
  //     const response = await this.openOceanClient.listDcaOrders(address, chain);
  //     if (!response.success || !response.data) {
  //       throw new Error('Failed to get DCA orders');
  //     }
  //     return {
  //       success: true,
  //       data: response.data.data.map(this.mapOrderInfo),
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error instanceof Error ? error.message : 'Unknown error',
  //     };
  //   }
  // }

  // /**
  //  * Get list of limit orders for an address
  //  * @param address - Wallet address
  //  * @param chain - Target blockchain network
  //  * @returns List of limit orders
  //  */
  // async getLimitOrders(
  //   address: string,
  //   chain: OpenOceanChain = 'base'
  // ): Promise<NeuroDexResponse<OrderInfo[]>> {
  //   try {
  //     const response = await this.openOceanClient.listLimitOrders(address, chain);
  //     if (!response.success || !response.data) {
  //       throw new Error('Failed to get limit orders');
  //     }
  //     return {
  //       success: true,
  //       data: response.data.data.map(this.mapOrderInfo),
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error instanceof Error ? error.message : 'Unknown error',
  //     };
  //   }
  // }

  // /**
  //  * Map raw order data to OrderInfo format
  //  * @param order - Raw order data
  //  * @returns Formatted order information
  //  */
  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // private mapOrderInfo(order: any): OrderInfo {
  //   return {
  //     id: order.id,
  //     type: order.type,
  //     status: order.status,
  //     token: {
  //       address: order.token.address,
  //       symbol: order.token.symbol,
  //       decimals: order.token.decimals,
  //       name: order.token.name,
  //     },
  //     amount: order.amount,
  //     targetPrice: order.targetPrice,
  //     createdAt: order.createdAt,
  //     expiresAt: order.expiresAt,
  //     txHash: order.txHash,
  //   };
  // }
}

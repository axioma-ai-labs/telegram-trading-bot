import { OpenOceanClient } from '@/services/engine/openocean.service';
import { ViemService } from '@/services/engine/viem.service';
import { config } from '@/config/config';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { BalancesResponse, Chain, GoldRushClient } from '@covalenthq/client-sdk';
import {
  DcaParams,
  LimitOrderParams,
  NeuroDexResponse,
  TokenInfo,
  OrderInfo,
  WalletInfo,
  SwapResponse,
  BuyParams,
  SellParams,
} from '@/types/neurodex';
import { DcaOrderResponse, LimitOrderResponse, OpenOceanChain } from '@/types/openocean';
import { Address, createPublicClient, formatEther, parseUnits, http } from 'viem';

/**
 * NeuroDex API service for handling trading operations
 * Wraps OpenOcean functionality and provides high-level trading methods
 */
export class NeuroDexApi {
  private readonly openOceanClient: OpenOceanClient;
  private readonly viemService: ViemService;
  private readonly nativeTokenAddress: Record<OpenOceanChain, string> = {
    base: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    ethereum: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    bsc: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  };

  constructor() {
    this.openOceanClient = new OpenOceanClient({
      rpcUrl: config.node.baseMainnetRpc,
      addonId: config.node.openOceanAddonId,
      defaultChain: 'base',
    });
    this.viemService = new ViemService();
  }

  async createWallet(): Promise<WalletInfo> {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    return {
      address: account.address,
      privateKey,
    };
  }

  async getTokenBalances(
    chain: string = 'eth-mainnet',
    address: string
  ): Promise<BalancesResponse | null> {
    const client = new GoldRushClient(config.covalenthq_api_key);
    const response = await client.BalanceService.getTokenBalancesForWalletAddress(
      chain as Chain,
      address
    );

    console.log(response.data);
    return response.data;
  }

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

  private async getGasPrice(chain: OpenOceanChain = 'base'): Promise<string> {
    const response = await this.openOceanClient.getGasPrice(chain);
    if (!response.success || !response.data || !response.data.data) {
      throw new Error('Failed to get gas price');
    }
    // TODO: Add support for different gas prices
    return response.data.data.standard;
  }

  async getTokenInfo(
    tokenAddress: string,
    chain: OpenOceanChain = 'base'
  ): Promise<NeuroDexResponse<TokenInfo>> {
    try {
      const response = await this.openOceanClient.getTokens(chain);
      if (!response.success || !response.data || !response.data.data) {
        throw new Error('Failed to get token list');
      }

      const token = response.data.data.find(
        (t: TokenInfo) => t.address.toLowerCase() === tokenAddress.toLowerCase()
      );
      if (!token) {
        throw new Error('Token not found');
      }

      return {
        success: true,
        data: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          name: token.name,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Buy a given amount of `tokenAddress` using the chain's native token.
   * 1) Reverse-quote how much native token is needed.
   * 2) Swap that native token for your token.
   */
  async buy(
    params: BuyParams,
    chain: OpenOceanChain = 'base'
  ): Promise<NeuroDexResponse<SwapResponse>> {
    try {
      // 1) figure out how much native we need to spend
      const gasPrice = await this.getGasPrice(chain);
      const native = this.nativeTokenAddress[chain];
      const quote = await this.openOceanClient.quote(
        {
          inTokenAddress: native,
          outTokenAddress: params.tokenAddress,
          amountDecimals: params.amount,
          gasPriceDecimals: gasPrice,
        },
        chain
      );
      if (!quote.success) throw new Error(quote.error);

      // 2) Prepare swap
      const swap = await this.openOceanClient.swap(
        {
          inTokenAddress: native,
          outTokenAddress: params.tokenAddress,
          amount: params.amount,
          gasPrice,
          slippage: params.slippage ?? '1',
          account: params.walletAddress,
        },
        chain
      );
      if (!swap.success || !swap.data) throw new Error(swap.error || 'Swap data is undefined');

      // 3) Execute swap
      const account = privateKeyToAccount(params.privateKey as `0x${string}`);
      const receipt = await this.viemService.executeTransaction(account, {
        to: swap.data.data.to as Address,
        data: swap.data.data.data,
        value: swap.data.data.value,
        gasPrice: swap.data.data.gasPrice,
      });

      return {
        success: true,
        data: {
          inToken: swap.data.data.inToken,
          outToken: swap.data.data.outToken,
          inAmount: swap.data.data.inAmount,
          outAmount: swap.data.data.outAmount,
          estimatedGas: swap.data.data.estimatedGas,
          price_impact: swap.data.data.price_impact,
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
   * Sell a given `amount` of tokenAddress into the chain's native token.
   * Single swap: token -> native.
   */
  async sell(
    params: SellParams,
    chain: OpenOceanChain = 'base'
  ): Promise<NeuroDexResponse<SwapResponse>> {
    try {
      // 1) figure out how much native we need to spend
      const gasPrice = await this.getGasPrice(chain);
      const native = this.nativeTokenAddress[chain];
      const quote = await this.openOceanClient.quote(
        {
          inTokenAddress: params.tokenAddress,
          outTokenAddress: native,
          amountDecimals: params.amount,
          gasPriceDecimals: gasPrice,
        },
        chain
      );
      if (!quote.success) throw new Error(quote.error);

      // 2) Prepare swap
      const swap = await this.openOceanClient.swap(
        {
          inTokenAddress: params.tokenAddress,
          outTokenAddress: native,
          amount: params.amount,
          gasPrice,
          slippage: params.slippage ?? '1',
          account: params.walletAddress,
        },
        chain
      );
      if (!swap.success || !swap.data) throw new Error(swap.error || 'Swap data is undefined');

      // 3) Execute swap
      const account = privateKeyToAccount(params.privateKey as `0x${string}`);
      const receipt = await this.viemService.executeTransaction(account, {
        to: swap.data.data.to as Address,
        data: swap.data.data.data,
        value: swap.data.data.value,
        gasPrice: swap.data.data.gasPrice,
      });

      return {
        success: true,
        data: {
          inToken: swap.data.data.inToken,
          outToken: swap.data.data.outToken,
          inAmount: swap.data.data.inAmount,
          outAmount: swap.data.data.outAmount,
          estimatedGas: swap.data.data.estimatedGas,
          price_impact: swap.data.data.price_impact,
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
   * Create a DCA (Dollar Cost Averaging) order
   * @param params - DCA parameters
   * @param chain - Target blockchain network
   * @returns DCA order data
   */
  async createDca(
    params: DcaParams,
    chain: OpenOceanChain = 'base'
  ): Promise<NeuroDexResponse<DcaOrderResponse>> {
    try {
      const response = await this.openOceanClient.createDca(
        {
          inTokenAddress: this.nativeTokenAddress[chain],
          outTokenAddress: params.tokenAddress,
          totalAmount: params.totalAmount,
          intervals: params.intervals,
          intervalDuration: params.intervalDuration,
          account: params.walletAddress,
          slippage: params.slippage?.toString(),
        },
        chain
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to create DCA order');
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a limit order
   * @param params - Limit order parameters
   * @param chain - Target blockchain network
   * @returns Limit order data
   */
  async createLimitOrder(
    params: LimitOrderParams,
    chain: OpenOceanChain = 'base'
  ): Promise<NeuroDexResponse<LimitOrderResponse>> {
    try {
      const response = await this.openOceanClient.createLimitOrder(
        {
          makerTokenAddress: this.nativeTokenAddress[chain],
          takerTokenAddress: params.tokenAddress,
          makerAmount: parseUnits(params.targetPrice, 18).toString(),
          takerAmount: params.amount,
          account: params.walletAddress,
          expireTime: params.expireTime,
        },
        chain
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to create limit order');
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel a DCA order
   * @param orderHash - Order hash to cancel
   * @param chain - Target blockchain network
   * @returns Cancellation result
   */
  async cancelDca(
    orderHash: string,
    chain: OpenOceanChain = 'base'
  ): Promise<NeuroDexResponse<boolean>> {
    try {
      const response = await this.openOceanClient.cancelDca(orderHash, chain);
      if (!response.success) {
        throw new Error('Failed to cancel DCA order');
      }
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel a limit order
   * @param orderHash - Order hash to cancel
   * @param chain - Target blockchain network
   * @returns Cancellation result
   */
  async cancelLimitOrder(
    orderHash: string,
    chain: OpenOceanChain = 'base'
  ): Promise<NeuroDexResponse<boolean>> {
    try {
      const response = await this.openOceanClient.cancelLimitOrder(orderHash, chain);
      if (!response.success) {
        throw new Error('Failed to cancel limit order');
      }
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get list of DCA orders for an address
   * @param address - Wallet address
   * @param chain - Target blockchain network
   * @returns List of DCA orders
   */
  async getDcaOrders(
    address: string,
    chain: OpenOceanChain = 'base'
  ): Promise<NeuroDexResponse<OrderInfo[]>> {
    try {
      const response = await this.openOceanClient.listDcaOrders(address, chain);
      if (!response.success || !response.data) {
        throw new Error('Failed to get DCA orders');
      }
      return {
        success: true,
        data: response.data.data.map(this.mapOrderInfo),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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
    address: string,
    chain: OpenOceanChain = 'base'
  ): Promise<NeuroDexResponse<OrderInfo[]>> {
    try {
      const response = await this.openOceanClient.listLimitOrders(address, chain);
      if (!response.success || !response.data) {
        throw new Error('Failed to get limit orders');
      }
      return {
        success: true,
        data: response.data.data.map(this.mapOrderInfo),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Map raw order data to OrderInfo format
   * @param order - Raw order data
   * @returns Formatted order information
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapOrderInfo(order: any): OrderInfo {
    return {
      id: order.id,
      type: order.type,
      status: order.status,
      token: {
        address: order.token.address,
        symbol: order.token.symbol,
        decimals: order.token.decimals,
        name: order.token.name,
      },
      amount: order.amount,
      targetPrice: order.targetPrice,
      createdAt: order.createdAt,
      expiresAt: order.expiresAt,
      txHash: order.txHash,
    };
  }
}

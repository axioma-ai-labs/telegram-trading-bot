import { OpenOceanClient } from './openocean.service';
import { config } from '../../config/config';
import { formatEther, parseUnits } from 'ethers';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { Chain, GoldRushClient } from '@covalenthq/client-sdk';
import {
  BuyParams,
  SellParams,
  DcaParams,
  LimitOrderParams,
  NeuroDexResponse,
  TokenInfo,
  OrderInfo,
  WalletInfo,
} from '../../types/neurodex';
import { OpenOceanChain } from '../../types/openocean';
import { createPublicClient } from 'viem';
import { http } from 'viem';

/**
 * NeuroDex API service for handling trading operations
 * Wraps OpenOcean functionality and provides high-level trading methods
 */
export class NeuroDexApi {
  private readonly openOceanClient: OpenOceanClient;
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
  }

  async createWallet(): Promise<WalletInfo> {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    return {
      address: account.address,
      privateKey,
    };
  }

  async getTokenBalances(chain: string = 'eth-mainnet', address: string): Promise<any> {
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
        (t: any) => t.address.toLowerCase() === tokenAddress.toLowerCase()
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

  async buy(params: BuyParams, chain: OpenOceanChain = 'base'): Promise<NeuroDexResponse<any>> {
    try {
      const gasPrice = await this.getGasPrice(chain);
      const slippage = params.slippage || config.trading.defaultSlippage;

      const response = await this.openOceanClient.swap(
        {
          inTokenAddress: this.nativeTokenAddress[chain],
          outTokenAddress: params.tokenAddress,
          amount: params.nativeAmount,
          gasPrice,
          slippage: slippage.toString(),
          account: params.account,
        },
        chain
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to create swap transaction');
      }

      return {
        success: true,
        data: response.data,
        txHash: response.data.txHash,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sell(params: SellParams, chain: OpenOceanChain = 'base'): Promise<NeuroDexResponse<any>> {
    try {
      const gasPrice = await this.getGasPrice(chain);
      const slippage = params.slippage || config.trading.defaultSlippage;

      const response = await this.openOceanClient.swap(
        {
          inTokenAddress: params.tokenAddress,
          outTokenAddress: this.nativeTokenAddress[chain],
          amount: params.amount,
          gasPrice,
          slippage: slippage.toString(),
          account: params.account,
        },
        chain
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to create swap transaction');
      }

      return {
        success: true,
        data: response.data,
        txHash: response.data.txHash,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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
  ): Promise<NeuroDexResponse<any>> {
    try {
      const response = await this.openOceanClient.createDca(
        {
          inTokenAddress: this.nativeTokenAddress[chain],
          outTokenAddress: params.tokenAddress,
          totalAmount: params.totalAmount,
          intervals: params.intervals,
          intervalDuration: params.intervalDuration,
          account: params.account,
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
  ): Promise<NeuroDexResponse<any>> {
    try {
      const response = await this.openOceanClient.createLimitOrder(
        {
          makerTokenAddress: this.nativeTokenAddress[chain],
          takerTokenAddress: params.tokenAddress,
          makerAmount: parseUnits(params.targetPrice, 18).toString(),
          takerAmount: params.amount,
          account: params.account,
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
  ): Promise<NeuroDexResponse<any>> {
    try {
      const response = await this.openOceanClient.cancelDca(orderHash, chain);
      if (!response.success) {
        throw new Error('Failed to cancel DCA order');
      }
      return response;
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
  ): Promise<NeuroDexResponse<any>> {
    try {
      const response = await this.openOceanClient.cancelLimitOrder(orderHash, chain);
      if (!response.success) {
        throw new Error('Failed to cancel limit order');
      }
      return response;
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
        data: response.data.map(this.mapOrderInfo),
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
        data: response.data.map(this.mapOrderInfo),
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

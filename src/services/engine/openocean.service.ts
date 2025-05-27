import { LimitOrderNodeSdk } from '@openocean.finance/limitorder-sdk';
import axios, { AxiosInstance } from 'axios';
import Web3 from 'web3';

import logger from '@/config/logger';
import {
  DcaOrderCreateApiParams,
  DcaOrderCreateParams,
  DcaOrderGetParams,
  DcaOrdersResponse,
  GasPriceResponse,
  LimitOrderCancelOnchainParams,
  LimitOrderCreateParams,
  LimitOrdersResponse,
  NeuroDexChain,
  NeuroDexChainToOpenOceanChain,
  OpenOceanResponse,
  QuoteParams,
  QuoteResponse,
  SwapParams,
  SwapResponse,
  TokenListResponse,
} from '@/types/openocean';

/**
 * OpenOcean API client for interacting with OpenOcean DEX aggregator via QuickNode
 * Supports Base, Ethereum and BNB chains
 *
 * Includes endpoints:
 * General: swap, reverseQuote, getTokens, getGasPrice,
 * Limit Orders: createLimitOrder, cancelLimitOrder, listLimitOrders,
 * DCA: createDca, cancelDca, listDcaOrders, listAllDcaOrders
 */
export class OpenOceanClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly defaultChain: NeuroDexChain;
  private sdk: LimitOrderNodeSdk | null = null;
  private chainId: number | null = null;
  private dca: boolean = false;

  /**
   * Creates a new OpenOcean client instance
   * @param config - Configuration object containing RPC URL, addon ID and default chain
   */
  constructor(defaultChain: NeuroDexChain) {
    this.defaultChain = defaultChain;
    this.axiosInstance = axios.create({
      baseURL: 'https://open-api.openocean.finance',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Initializes the SDK with Web3 provider and account
   * @param provider - Web3 provider instance
   * @param account - Wallet address
   * @param chainId - Chain ID
   */
  initializeSdk(chainId: number, provider: Web3, address: string, dca: boolean = false): void {
    this.chainId = chainId;
    this.dca = dca;
    if (this.dca) {
      this.sdk = new LimitOrderNodeSdk(chainId, provider, address, 'Dca');
    } else {
      this.sdk = new LimitOrderNodeSdk(chainId, provider, address);
    }
  }

  /**
   * Builds the API endpoint URL for a specific chain and endpoint
   * @param chain - Target blockchain network
   * @param endpoint - API endpoint path
   * @param version - API version (defaults to v4)
   * @returns Full API endpoint URL
   */
  private buildEndpoint(chain: NeuroDexChain, endpoint: string, version: string = 'v4'): string {
    return `/${version}/${chain}/${endpoint}`;
  }

  /**
   * Gets a quote for a token swap. Quote endpoint says you how much you will get out for a given
   * amount of input token (amountDecimals).
   * @param params - Quote parameters
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns Quote data including token info, amounts, and routing details
   */
  async quote(
    params: QuoteParams,
    chain: NeuroDexChain = this.defaultChain
  ): Promise<OpenOceanResponse<QuoteResponse>> {
    try {
      const { data } = await this.axiosInstance.get(this.buildEndpoint(chain, 'quote'), {
        params,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (data.code !== 200) {
        logger.error(
          `Quote failed with code: ${data.code}. The full response is: ${JSON.stringify(data)}`
        );
        throw new Error(`Quote failed with code: ${data.code}.`);
      }
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Gets a reverse quote for a desired output amount
   * @param params - Reverse quote parameters
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns Quote data
   */
  async reverseQuote(
    params: QuoteParams,
    chain: NeuroDexChain = this.defaultChain
  ): Promise<OpenOceanResponse<QuoteResponse>> {
    try {
      const { data } = await this.axiosInstance.get(this.buildEndpoint(chain, 'reverseQuote'), {
        params,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (data.code !== 200) {
        logger.error(
          `Reverse quote failed with code: ${data.code}. ` +
            `The full response is: ${JSON.stringify(data)}`
        );
        throw new Error(`Reverse quote failed with code: ${data.code}.`);
      }
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Prepares a swap operation
   * @param params - Swap parameters
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns Swap transaction data
   */
  async swap(
    params: SwapParams,
    chain: NeuroDexChain = this.defaultChain
  ): Promise<OpenOceanResponse<SwapResponse>> {
    try {
      const { data } = await this.axiosInstance.get(this.buildEndpoint(chain, 'swap'), {
        params,
        headers: {
          'x-qn-api-chain': chain,
        },
      });
      if (data.code !== 200) {
        logger.error(
          `Swap failed with code: ${data.code}. The full response is: ${JSON.stringify(data)}`
        );
        throw new Error(`Swap failed with code: ${data.code}.`);
      }
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Gets list of supported tokens for a chain
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns List of tokens
   */
  async getTokens(
    chain: NeuroDexChain = this.defaultChain
  ): Promise<OpenOceanResponse<TokenListResponse>> {
    try {
      const { data } = await this.axiosInstance.get(this.buildEndpoint(chain, 'tokenList'), {
        headers: {
          'x-qn-api-chain': chain,
        },
      });
      if (data.code !== 200) {
        logger.error(
          `Get tokens failed with code: ${data.code}. The full response is: ${JSON.stringify(data)}`
        );
        throw new Error(`Get tokens failed with code: ${data.code}.`);
      }
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Gets current gas price for a chain
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns Gas price data
   */
  async getGasPrice(
    chain: NeuroDexChain = this.defaultChain
  ): Promise<OpenOceanResponse<GasPriceResponse>> {
    try {
      const { data } = await this.axiosInstance.get(this.buildEndpoint(chain, 'gasPrice'), {
        headers: {
          'x-qn-api-chain': chain,
        },
      });
      if (data.code !== 200) {
        logger.error(
          `Get gas price failed with code: ${data.code}. ` +
            `The full response is: ${JSON.stringify(data)}`
        );
        throw new Error(`Get gas price failed with code: ${data.code}.`);
      }
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Creates a limit order using the SDK.
   * This is only a wrapper! No logic is implemented here.
   * @param params - Limit order parameters
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns Created order data
   */
  async createLimitOrder(
    params: LimitOrderCreateParams,
    chain: NeuroDexChain = this.defaultChain
  ): Promise<OpenOceanResponse<{ code: number }>> {
    try {
      if (!this.sdk) {
        throw new Error('SDK not initialized. Call initializeSdk first.');
      }

      const chainId = NeuroDexChainToOpenOceanChain[chain];
      if (this.chainId && this.chainId !== chainId) {
        throw new Error('SDK not initialized for this chain');
      }

      const order = {
        makerTokenAddress: params.makerTokenAddress,
        makerTokenDecimals: params.makerTokenDecimals,
        takerTokenAddress: params.takerTokenAddress,
        takerTokenDecimals: params.takerTokenDecimals,
        makerAmount: params.makerAmount,
        takerAmount: params.takerAmount,
        gasPrice: params.gasPrice,
        expire: params.expire,
      };

      const orderData = await this.sdk.createLimitOrder(order);

      if (!chainId) {
        throw new Error('Invalid chain');
      }

      // Submit the order to the API
      const apiParams = {
        ...orderData,
        referrer: params.referrer || undefined,
        referrerFee: params.referrerFee || undefined,
      };
      const { data } = await this.axiosInstance.post(
        // The chainId is not really NeuroDexChain, but we put it here to avoind linting errors
        this.buildEndpoint(chainId.toString() as NeuroDexChain, 'limit-order', 'v1'),
        apiParams,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (data.code !== 200) {
        logger.error(
          `Create limit order failed with code: ${data.code}. ` +
            `The full response is: ${JSON.stringify(data)}`
        );
        throw new Error(`Create limit order failed with code: ${data.code}.`);
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancels a limit order using the SDK
   * @param orderHash - Order hash
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns Cancellation result
   */
  async cancelLimitOrderAPI(
    orderHash: string,
    chain: NeuroDexChain = this.defaultChain
  ): Promise<OpenOceanResponse<{ code: number }>> {
    try {
      // First cancel on API
      const chainId = NeuroDexChainToOpenOceanChain[chain];
      if (!chainId) {
        throw new Error('Invalid chain');
      }
      const { data: apiCancelResult } = await this.axiosInstance.post(
        this.buildEndpoint(
          // The chainId is not really NeuroDexChain, but we put it here to avoind linting errors
          chainId.toString() as NeuroDexChain,
          'limit-order/cancelLimitOrder',
          'v1'
        ),
        { orderHash: orderHash },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (apiCancelResult.code !== 200) {
        logger.error(
          `Cancel limit order failed with code: ${apiCancelResult.code}. ` +
            `The full response is: ${JSON.stringify(apiCancelResult)}`
        );
        throw new Error(`Cancel limit order failed with code: ${apiCancelResult.code}.`);
      }

      if (!(apiCancelResult.data.status === 3 || apiCancelResult.data.status === 4)) {
        throw new Error('Failed to cancel order on API');
      }

      return { success: true, data: apiCancelResult };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel a limit order onchain
   * @param params - Cancel order parameters
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns Cancellation result
   */
  async cancelLimitOrderOnchain(
    params: LimitOrderCancelOnchainParams,
    chain: NeuroDexChain = this.defaultChain
  ): Promise<OpenOceanResponse<{ code: number }>> {
    try {
      if (!this.sdk) {
        throw new Error('SDK not initialized. Call initializeSdk first.');
      }
      const chainId = NeuroDexChainToOpenOceanChain[chain];
      // Check if chain is the same as the chain the SDK
      if (this.chainId && this.chainId !== chainId) {
        throw new Error('SDK not initialized for this chain');
      }

      const sdkResult = await this.sdk.cancelLimitOrder({
        orderData: params.orderData,
        gasPrice: params.gasPrice,
      });
      return { success: true, data: sdkResult };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Gets detailed limit order information for an address
   * @param address - Wallet address
   * @param statuses - Optional status filter (default shows open orders).
   *                   eg: [1,2,3], 1-unfill, 2-fail, 3-cancel, 4-filled,
   *                   5-pending, 6- hash not exist, 7-expire
   * @param limit - Optional limit (default 100)
   * @param page - Optional page (default 1)
   * @param sortBy - Optional sort by (default createDateTime)
   * @param exclude - Optional exclude (default 0)
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns List of detailed limit orders
   */
  async getLimitOrders(
    address: string,
    statuses: Array<number> = [1, 2, 5],
    limit: number = 100,
    page: number = 1,
    sortBy: string = 'createDateTime',
    exclude: string = '0',
    chain: NeuroDexChain = this.defaultChain
  ): Promise<OpenOceanResponse<LimitOrdersResponse>> {
    try {
      const statusesString = `[${statuses.join(',')}]`;
      const chainId = NeuroDexChainToOpenOceanChain[chain];
      if (!chainId) {
        throw new Error('Invalid chain');
      }
      if (this.chainId && this.chainId !== chainId) {
        throw new Error('SDK not initialized for this chain');
      }
      const { data } = await this.axiosInstance.get(
        // The chainId is not really NeuroDexChain, but we put it here to avoind linting errors
        this.buildEndpoint(
          chainId.toString() as NeuroDexChain,
          `limit-order/address/${address}`,
          'v1'
        ),
        {
          params: {
            statuses: statusesString,
            page: page,
            limit: limit,
            sortBy: sortBy,
            exclude: exclude,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (data.code !== 200) {
        logger.error(
          `Get limit orders failed with code: ${data.code}. ` +
            `The full response is: ${JSON.stringify(data)}`
        );
        throw new Error(`Get limit orders failed with code: ${data.code}.`);
      }
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Creates a DCA order using the SDK and submits it to the API
   * @param params - DCA order parameters
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns Created DCA order data
   */
  async createDcaOrder(
    params: DcaOrderCreateParams,
    chain: NeuroDexChain = this.defaultChain
  ): Promise<OpenOceanResponse<{ code: number }>> {
    try {
      if (!this.sdk) {
        throw new Error('SDK not initialized. Call initializeSdk first.');
      }
      if (!this.dca) {
        throw new Error('SDK not initialized for DCA. Call initializeSdk with dca=true first.');
      }
      // Check if chain is the same as the chain the SDK
      const chainId = NeuroDexChainToOpenOceanChain[chain];

      const order = {
        makerTokenAddress: params.makerTokenAddress,
        makerTokenDecimals: params.makerTokenDecimals,
        takerTokenAddress: params.takerTokenAddress,
        takerTokenDecimals: params.takerTokenDecimals,
        makerAmount: params.makerAmount,
        takerAmount: params.takerAmount,
        gasPrice: params.gasPrice,
        expire: params.expire,
      };
      const sdkOrder = await this.sdk.createLimitOrder(order);

      // Prepare API parameters
      const apiParams: DcaOrderCreateApiParams = {
        ...sdkOrder,
        expireTime: params.time * (params.times + 1),
        time: params.time,
        times: params.times,
        version: 'v2',
        minPrice: params.minPrice || undefined,
        maxPrice: params.maxPrice || undefined,
        referrer: params.referrer || undefined,
        referrerFee: params.referrerFee || undefined,
      };

      // Submit to API
      const { data } = await this.axiosInstance.post(
        // The chainId is not really NeuroDexChain, but we put it here to avoind linting errors
        this.buildEndpoint(chainId!.toString() as NeuroDexChain, 'dca/swap', 'v1'),
        apiParams,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (data.code !== 200) {
        logger.error(
          `Create DCA order failed with code: ${data.code}. ` +
            `The full response is: ${JSON.stringify(data)}`
        );
        throw new Error(`Create DCA order failed with code: ${data.code}.`);
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancels a DCA order using API
   * @param orderHash - Order hash to cancel
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns Cancellation result
   */
  async cancelDcaOrderAPI(
    orderHash: string,
    chain: NeuroDexChain = this.defaultChain
  ): Promise<OpenOceanResponse<{ code: number }>> {
    try {
      const chainId = NeuroDexChainToOpenOceanChain[chain];
      if (!chainId) {
        throw new Error('Invalid chain');
      }

      // Cancel DCA order on API
      const { data: apiCancelResult } = await this.axiosInstance.post(
        // The chainId is not really NeuroDexChain, but we put it here to avoind linting errors
        this.buildEndpoint(chainId.toString() as NeuroDexChain, 'dca/cancel', 'v1'),
        { orderHash },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (apiCancelResult.code !== 200) {
        logger.error(
          `Cancel DCA order failed with code: ${apiCancelResult.code}. ` +
            `The full response is: ${JSON.stringify(apiCancelResult)}`
        );
        throw new Error(`Cancel DCA order failed with code: ${apiCancelResult.code}.`);
      }

      return { success: true, data: apiCancelResult };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Gets list of DCA orders for an address
   * @param params - Parameters for getting DCA orders
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns List of DCA orders
   */
  async getDcaOrders(
    params: DcaOrderGetParams,
    chain: NeuroDexChain = this.defaultChain
  ): Promise<OpenOceanResponse<DcaOrdersResponse>> {
    try {
      const chainId = NeuroDexChainToOpenOceanChain[chain];
      if (!chainId) {
        throw new Error('Invalid chain');
      }

      const address = params.address || '';
      const statuses = `[${params.statuses.join(',')}]`;
      const limit = params.limit || 100;

      const { data } = await this.axiosInstance.get(
        // The chainId is not really NeuroDexChain, but we put it here to avoind linting errors
        this.buildEndpoint(chainId.toString() as NeuroDexChain, `dca/address/${address}`, 'v1'),
        {
          params: {
            statuses,
            limit,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (data.code !== 200) {
        logger.error(
          `Get DCA orders failed with code: ${data.code}. ` +
            `The full response is: ${JSON.stringify(data)}`
        );
        throw new Error(`Get DCA orders failed with code: ${data.code}.`);
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Gets list of all DCA orders
   * @param params - Parameters for getting all DCA orders
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns List of all DCA orders
   */
  async getAllDcaOrders(
    params: DcaOrderGetParams,
    chain: NeuroDexChain = this.defaultChain
  ): Promise<OpenOceanResponse<DcaOrdersResponse>> {
    try {
      const chainId = NeuroDexChainToOpenOceanChain[chain];
      if (!chainId) {
        throw new Error('Invalid chain');
      }

      const statuses = `[${params.statuses.join(',')}]`;
      const limit = params.limit || 100;

      const { data } = await this.axiosInstance.get(
        // The chainId is not really NeuroDexChain, but we put it here to avoind linting errors
        this.buildEndpoint(chainId.toString() as NeuroDexChain, 'dca/all', 'v1'),
        {
          params: {
            statuses,
            limit,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (data.code !== 200) {
        logger.error(
          `Get all DCA orders failed with code: ${data.code}. ` +
            `The full response is: ${JSON.stringify(data)}`
        );
        throw new Error(`Get all DCA orders failed with code: ${data.code}.`);
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

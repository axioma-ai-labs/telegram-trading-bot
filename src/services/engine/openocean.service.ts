import axios, { AxiosInstance } from 'axios';
import {
  OpenOceanChain,
  OpenOceanConfig,
  OpenOceanResponse,
  SwapParams,
  ReverseQuoteParams,
  LimitOrderParams,
  DcaParams,
} from '../../types/openocean';

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
  private readonly config: OpenOceanConfig;

  /**
   * Creates a new OpenOcean client instance
   * @param config - Configuration object containing RPC URL, addon ID and default chain
   */
  constructor(config: OpenOceanConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: 'https://open-api.openocean.finance',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Builds the API endpoint URL for a specific chain and endpoint
   * @param chain - Target blockchain network
   * @param endpoint - API endpoint path
   * @param version - API version (defaults to v4)
   * @returns Full API endpoint URL
   */
  private buildEndpoint(chain: OpenOceanChain, endpoint: string, version: string = 'v4'): string {
    return `/${version}/${chain}/${endpoint}`;
  }

  /**
   * Executes a swap operation
   * @param params - Swap parameters
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns Swap transaction data
   */
  async swap(
    params: SwapParams,
    chain: OpenOceanChain = this.config.defaultChain
  ): Promise<OpenOceanResponse<any>> {
    try {
      const { data } = await this.axiosInstance.get(this.buildEndpoint(chain, 'swap'), {
        params,
        headers: {
          'x-qn-api-chain': chain,
        },
      });
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
    params: ReverseQuoteParams,
    chain: OpenOceanChain = this.config.defaultChain
  ): Promise<OpenOceanResponse<any>> {
    try {
      const { data } = await this.axiosInstance.get(this.buildEndpoint(chain, 'reverseQuote'), {
        params,
        headers: {
          'x-qn-api-chain': chain,
        },
      });
      return { success: true, data: data.data };
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
    chain: OpenOceanChain = this.config.defaultChain
  ): Promise<OpenOceanResponse<any>> {
    try {
      const { data } = await this.axiosInstance.get(this.buildEndpoint(chain, 'tokenList'), {
        headers: {
          'x-qn-api-chain': chain,
        },
      });
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
    chain: OpenOceanChain = this.config.defaultChain
  ): Promise<OpenOceanResponse<any>> {
    try {
      const { data } = await this.axiosInstance.get(this.buildEndpoint(chain, 'gasPrice'), {
        headers: {
          'x-qn-api-chain': chain,
        },
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Creates a limit order
   * @param params - Limit order parameters
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns Created order data
   */
  async createLimitOrder(
    params: LimitOrderParams,
    chain: OpenOceanChain = this.config.defaultChain
  ): Promise<OpenOceanResponse<any>> {
    try {
      const { data } = await this.axiosInstance.post(
        this.buildEndpoint(chain, 'limit-order', 'v1'),
        params,
        {
          headers: {
            'x-qn-api-chain': chain,
          },
        }
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancels a limit order
   * @param hash - Order hash to cancel
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns Cancellation result
   */
  async cancelLimitOrder(
    hash: string,
    chain: OpenOceanChain = this.config.defaultChain
  ): Promise<OpenOceanResponse<any>> {
    try {
      const { data } = await this.axiosInstance.post(
        this.buildEndpoint(chain, 'cancelLimitOrder', 'v1'),
        { hash },
        {
          headers: {
            'x-qn-api-chain': chain,
          },
        }
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Gets list of limit orders for an address
   * @param address - Wallet address
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns List of orders
   */
  async listLimitOrders(
    address: string,
    chain: OpenOceanChain = this.config.defaultChain
  ): Promise<OpenOceanResponse<any>> {
    try {
      const { data } = await this.axiosInstance.get(
        this.buildEndpoint(chain, `address/${address}`, 'v1'),
        {
          headers: {
            'x-qn-api-chain': chain,
          },
        }
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Creates a DCA order
   * @param params - DCA parameters
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns Created DCA order data
   */
  async createDca(
    params: DcaParams,
    chain: OpenOceanChain = this.config.defaultChain
  ): Promise<OpenOceanResponse<any>> {
    try {
      const { data } = await this.axiosInstance.post(
        this.buildEndpoint(chain, 'dca/swap', 'v1'),
        params,
        {
          headers: {
            'x-qn-api-chain': chain,
          },
        }
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancels a DCA order
   * @param hash - DCA order hash to cancel
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns Cancellation result
   */
  async cancelDca(
    hash: string,
    chain: OpenOceanChain = this.config.defaultChain
  ): Promise<OpenOceanResponse<any>> {
    try {
      const { data } = await this.axiosInstance.post(
        this.buildEndpoint(chain, 'dca/cancel', 'v1'),
        { hash },
        {
          headers: {
            'x-qn-api-chain': chain,
          },
        }
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Gets list of DCA orders for an address
   * @param address - Wallet address
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns List of DCA orders
   */
  async listDcaOrders(
    address: string,
    chain: OpenOceanChain = this.config.defaultChain
  ): Promise<OpenOceanResponse<any>> {
    try {
      const { data } = await this.axiosInstance.get(
        this.buildEndpoint(chain, `dca/address/${address}`, 'v1'),
        {
          headers: {
            'x-qn-api-chain': chain,
          },
        }
      );
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
   * @param chain - Target blockchain network (defaults to config defaultChain)
   * @returns List of all DCA orders
   */
  async listAllDcaOrders(
    chain: OpenOceanChain = this.config.defaultChain
  ): Promise<OpenOceanResponse<any>> {
    try {
      const { data } = await this.axiosInstance.get(this.buildEndpoint(chain, 'dca/all', 'v1'), {
        headers: {
          'x-qn-api-chain': chain,
        },
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

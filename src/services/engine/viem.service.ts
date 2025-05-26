import {
  Abi,
  type Account,
  type Address,
  type Chain,
  type Hash,
  PublicClient,
  SendTransactionParameters,
  type TransactionReceipt,
  type WalletClient,
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
} from 'viem';
import { base } from 'viem/chains';

import { config } from '@/config/config';
import logger from '@/config/logger';
import { TokenInfo } from '@/types/neurodex';
import { erc20Abi } from '@/utils/abis';

/**
 * Viem service for executing smart contract transactions
 * Handles transaction execution, gas estimation, and receipt monitoring
 */
export class ViemService {
  private readonly chain: Chain;
  private readonly rpcUrl: string;

  constructor(chain: Chain = base, rpcUrl: string = config.node.baseMainnetRpc) {
    this.chain = chain;
    this.rpcUrl = rpcUrl;
  }

  /**
   * Create a wallet client for the given account
   */
  createWalletClient(account: Account): WalletClient {
    return createWalletClient({
      account,
      chain: this.chain,
      transport: http(this.rpcUrl),
    });
  }

  /**
   * Create a public client for the configured chain
   */
  createPublicClient(): PublicClient {
    return createPublicClient({
      chain: this.chain,
      transport: http(this.rpcUrl),
    });
  }

  /**
   * Execute a transaction
   * @param account - Account to execute transaction from
   * @param params - Transaction parameters
   * @returns Transaction receipt
   */
  async executeTransaction(
    account: Account,
    params: {
      to: Address;
      data: string;
      value: string;
      gasPrice: string;
    }
  ): Promise<TransactionReceipt> {
    try {
      const walletClient = this.createWalletClient(account);
      const publicClient = this.createPublicClient();

      // Prepare transaction parameters
      const txParams = {
        to: params.to,
        data: params.data as `0x${string}`,
        value: BigInt(params.value),
        gasPrice: BigInt(params.gasPrice),
      };

      // Send transaction
      const hash = await walletClient.sendTransaction(txParams as SendTransactionParameters);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return receipt;
    } catch (error) {
      logger.error('Transaction execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute a contract method
   * @param account - Account to execute transaction from
   * @param params - Contract method parameters
   * @returns Transaction receipt
   */
  async executeContractMethod(
    account: Account,
    params: {
      address: Address;
      abi: Abi;
      functionName: string;
      args: string[];
    }
  ): Promise<TransactionReceipt> {
    try {
      const publicClient = this.createPublicClient();
      const walletClient = this.createWalletClient(account);

      // Simulate to get the transaction request
      const { request } = await publicClient.simulateContract({
        address: params.address,
        abi: params.abi,
        functionName: params.functionName,
        args: params.args,
        account,
      });

      // Write transaction
      const hash = await walletClient.writeContract(request);

      // Wait for receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return receipt;
    } catch (error) {
      logger.error('Contract method execution failed:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for a transaction
   * @param params - Transaction parameters
   * @returns Estimated gas as string
   */
  async estimateGas(params: {
    to: Address;
    data: string;
    value: string;
    account: Account;
  }): Promise<string> {
    try {
      const publicClient = this.createPublicClient();

      const gasEstimate = await publicClient.estimateGas({
        account: params.account,
        to: params.to,
        data: params.data as `0x${string}`,
        value: BigInt(params.value),
      });

      return gasEstimate.toString();
    } catch (error) {
      logger.error('Gas estimation failed:', error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   * @param hash - Transaction hash
   * @returns Transaction receipt
   */
  async getTransactionReceipt(hash: Hash): Promise<TransactionReceipt> {
    const publicClient = this.createPublicClient();
    return publicClient.getTransactionReceipt({ hash });
  }

  /**
   * Get token allowance for ERC20 tokens
   * @param tokenAddress Token contract address
   * @param ownerAddress Owner address
   * @param spenderAddress Spender address (typically exchange contract)
   * @returns Allowance amount as string
   */
  async getTokenAllowance(
    tokenAddress: Address,
    ownerAddress: Address,
    spenderAddress: Address
  ): Promise<string> {
    try {
      // Native token (ETH) has unlimited allowance by design
      if (
        tokenAddress.toLowerCase() === config.nativeTokenAddress.base.toLowerCase() ||
        tokenAddress.toLowerCase() === config.nativeTokenAddress.ethereum.toLowerCase() ||
        tokenAddress.toLowerCase() === config.nativeTokenAddress.bsc.toLowerCase()
      ) {
        return config.MAX_UINT256;
      }

      const publicClient = this.createPublicClient();

      const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [ownerAddress, spenderAddress],
      });

      return allowance.toString();
    } catch (error) {
      logger.error('Error getting token allowance:', error);
      return '0';
    }
  }

  /**
   * Get token information using on-chain RPC calls
   * @param tokenAddress The token's contract address
   * @returns TokenInfo object with token details or null if failed
   */
  async getTokenInfo(tokenAddress: Address): Promise<TokenInfo | null> {
    try {
      // Handle native ETH specially
      if (tokenAddress.toLowerCase() === config.nativeTokenAddress.base.toLowerCase()) {
        return {
          address: config.nativeTokenAddress.base,
          symbol: 'ETH',
          decimals: 18,
        };
      }

      const publicClient = this.createPublicClient();

      // Make parallel requests for token data
      const [symbol, decimals] = await Promise.all([
        publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'symbol',
        }),
        publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'decimals',
        }),
      ]);

      return {
        address: tokenAddress,
        symbol: symbol as string,
        decimals: Number(decimals),
      };
    } catch (error) {
      logger.error('Error fetching token info:', error);
      return null;
    }
  }

  /**
   * Get token balance for a specific address
   * @param tokenAddress The token's contract address
   * @param walletAddress The wallet address to check balance for
   * @returns Token balance as string
   */
  async getTokenBalance(tokenAddress: Address, walletAddress: Address): Promise<string> {
    try {
      const publicClient = this.createPublicClient();

      // If it's ETH, get native balance
      if (tokenAddress.toLowerCase() === config.nativeTokenAddress.base.toLowerCase()) {
        const balance = await publicClient.getBalance({
          address: walletAddress,
        });
        return balance.toString();
      }

      // For ERC20 tokens
      const balance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [walletAddress],
      });

      return balance.toString();
    } catch (error) {
      logger.error('Error fetching token balance:', error);
      return '0';
    }
  }

  /**
   * Get native balance (ETH/BNB/BASE) for a wallet in readable format
   * @param address Wallet address
   * @returns Balance in ETH as string (e.g., "0.123")
   */
  async getNativeBalance(address: Address): Promise<string> {
    try {
      const publicClient = this.createPublicClient();
      const balance = await publicClient.getBalance({ address });
      return formatEther(balance);
    } catch (error) {
      logger.error('Error fetching native balance:', error);
      return '0';
    }
  }
}

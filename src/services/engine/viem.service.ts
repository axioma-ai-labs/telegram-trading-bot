import {
  createWalletClient,
  http,
  createPublicClient,
  type Account,
  type WalletClient,
  type Address,
  type Chain,
  type Hash,
  type TransactionReceipt,
  PublicClient,
  SendTransactionParameters,
  Abi,
} from 'viem';
import { base } from 'viem/chains';
import { config } from '@/config/config';

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
      maxFeePerGas?: string;
      maxPriorityFeePerGas?: string;
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
        ...(params.maxFeePerGas && {
          maxFeePerGas: BigInt(params.maxFeePerGas),
        }),
        ...(params.maxPriorityFeePerGas && {
          maxPriorityFeePerGas: BigInt(params.maxPriorityFeePerGas),
        }),
      };

      // Send transaction
      const hash = await walletClient.sendTransaction(txParams as SendTransactionParameters);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return receipt;
    } catch (error) {
      console.error('Transaction execution failed:', error);
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
      console.error('Contract method execution failed:', error);
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
      console.error('Gas estimation failed:', error);
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
}

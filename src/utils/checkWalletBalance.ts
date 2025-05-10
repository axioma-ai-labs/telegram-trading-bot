/**
 * Utility function to check wallet token balances with proper BigInt handling
 */
import { GoldRushClient, Chain } from '@covalenthq/client-sdk';
import { config } from '../config/config';
import { NeuroDexResponse } from '../types/neurodex';

/**
 * Fetches token balances for a wallet and handles BigInt serialization
 * @param chain - The blockchain network to query
 * @param address - The wallet address to check
 * @returns Formatted token balance data with BigInt values converted to strings
 */
export async function checkWalletBalance(
  chain: string = 'eth-mainnet',
  address: string
): Promise<NeuroDexResponse<any>> {
  try {
    const client = new GoldRushClient(config.covalenthq_api_key);
    const response = await client.BalanceService.getTokenBalancesForWalletAddress(
      chain as Chain,
      address
    );

    // Process the response to handle BigInt values
    const processedData = JSON.parse(JSON.stringify(response.data, replaceBigInt));

    return {
      success: true,
      data: processedData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking wallet balance',
    };
  }
}

/**
 * Helper function to replace BigInt values with strings during JSON serialization
 */
function replaceBigInt(_key: string, value: any): any {
  return typeof value === 'bigint' ? value.toString() : value;
}

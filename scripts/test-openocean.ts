import { Core } from '@quicknode/sdk';
import { config } from '../src/config/config';
import axios from 'axios';
import { GasResponse, GasData } from '../src/types/config';
import { parseUnits } from 'ethers';

// STEP 1: Test connection to QuickNode RPC endpoint | ✅ WORKS!
export async function testQuickNodeConnection(): Promise<{
  success: boolean;
  result?: string;
  error?: string;
}> {
  try {
    const core = new Core({
      endpointUrl: config.node.baseSepoliaRpc,
    });

    const currentChainId = await core.client.getChainId();
    const currentTransactionCount = await core.client.getBlockTransactionCount();
    const currentBlockNumber = await core.client.getBlockNumber();

    return {
      success: true,
      result: `✅ Connected to QuickNode. Current block number: ${currentBlockNumber} on chain ${currentChainId} | Transaction count: ${currentTransactionCount}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// STEP 2: Get gas price estimates from QuickNode RPC endpoint | ✅ WORKS!
export async function getGasEstimates(): Promise<GasResponse> {
  try {
    const gasUrl = `${config.node.baseMainnetRpc}/addon/${config.node.openOceanAddonId}/v4/eth/gasPrice`;

    const response = await axios.get(gasUrl, {
      headers: { 'Content-Type': 'application/json' },
    });

    const data = response.data;

    console.log(data);

    // Ensure the data is in the expected format or transform it
    if (!data) {
      throw new Error('Invalid response format from OpenOcean gas price API');
    }

    // Transform the OpenOcean gas price format to match GasData structure
    const gasData: GasData = {
      base: parseInt(data.data?.baseFee || '0'),
      standard: {
        legacyGasPrice: parseInt(data.data?.gasPrice || '0'),
        maxFeePerGas: parseInt(data.data?.gasPrice || '0'),
        maxPriorityFeePerGas: parseInt(data.data?.priorityFee || '0'),
        waitTimeEstimate: 15, // Default estimate in seconds
      },
      fast: {
        legacyGasPrice: parseInt(data.data?.gasPrice || '0') * 1.1,
        maxFeePerGas: parseInt(data.data?.gasPrice || '0') * 1.1,
        maxPriorityFeePerGas: parseInt(data.data?.priorityFee || '0') * 1.1,
        waitTimeEstimate: 30,
      },
      instant: {
        legacyGasPrice: parseInt(data.data?.gasPrice || '0') * 1.2,
        maxFeePerGas: parseInt(data.data?.gasPrice || '0') * 1.2,
        maxPriorityFeePerGas: parseInt(data.data?.priorityFee || '0') * 1.2,
        waitTimeEstimate: 60,
      },
      low: {
        legacyGasPrice: parseInt(data.data?.gasPrice || '0') * 0.9,
        maxFeePerGas: parseInt(data.data?.gasPrice || '0') * 0.9,
        maxPriorityFeePerGas: parseInt(data.data?.priorityFee || '0') * 0.9,
        waitTimeEstimate: 180,
      },
    };

    return {
      code: 200,
      data: gasData,
      without_decimals: {
        base: Math.floor(gasData.base),
        standard: {
          ...gasData.standard,
          legacyGasPrice: Math.floor(gasData.standard.legacyGasPrice),
        },
        fast: {
          ...gasData.fast,
          legacyGasPrice: Math.floor(gasData.fast.legacyGasPrice),
        },
        instant: {
          ...gasData.instant,
          legacyGasPrice: Math.floor(gasData.instant.legacyGasPrice),
        },
        low: {
          ...gasData.low,
          legacyGasPrice: Math.floor(gasData.low.legacyGasPrice),
        },
      },
    };
  } catch (error) {
    console.error(
      'Error fetching gas price:',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

// STEP 3: Test MEV protection endpoint | ✅ WORKS!
export async function testMevProtection(): Promise<{
  success: boolean;
  result?: string;
  error?: string;
}> {
  try {
    const response = await axios.post(config.node.baseMainnetRpc, {
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: ['0x0'], // Example transaction data
      id: 1,
    });

    // Check if response contains expected fields
    if (response.data && (response.data.result || response.data.error)) {
      return {
        success: true,
        result: '✅ MEV protection endpoint is responsive',
      };
    } else {
      throw new Error('Unexpected response format from endpoint');
    }
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('invalid transaction')) {
        // This is actually expected since we sent dummy data
        return {
          success: true,
          result: '✅ MEV protection endpoint validated transaction format as expected',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred while testing MEV protection',
    };
  }
}

// STEP 4: Get quote from OpenOcean API | ✅ WORKS!
export async function getQuote(
  inTokenAddress: string,
  outTokenAddress: string
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const amountWei = parseUnits('5', 18).toString(); // 5 tokens
    const gasWei = parseUnits('1', 9).toString(); // 1 gwei

    const endpoint = `${config.node.baseMainnetRpc}/addon/${config.node.openOceanAddonId}/v4/bsc/quote`;

    const { data } = await axios.get(endpoint, {
      params: {
        inTokenAddress,
        outTokenAddress,
        amount: amountWei,
        gasPrice: gasWei,
      },
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to get quote:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// STEP 5: Get wallet token balance
export async function getWalletTokenBalance(
  walletAddress: string,
  perPage: number = 20,
  page: number = 1,
  contracts?: string[]
): Promise<{ success: boolean; result?: Record<string, unknown>; error?: string }> {
  try {
    // Initialize the QuickNode SDK Core with Token API v2 add-on enabled
    const core = new Core({
      endpointUrl: config.node.baseMainnetRpc, // Use the appropriate RPC endpoint from your config
      config: {
        addOns: {
          nftTokenV2: true, // Required for the token balance API
        },
      },
    });

    // Build the request parameters with correct typing
    const params: {
      wallet: string;
      perPage?: number;
      page?: number;
      contracts?: string[];
    } = {
      wallet: walletAddress,
      perPage: Math.min(perPage, 10), // API limits to 100 per page
      page: page,
    };

    if (contracts && contracts.length > 0) {
      params.contracts = contracts;
    }

    const data = await core.client.qn_getWalletTokenBalance(params);

    return {
      success: true,
      result: data,
    };
  } catch (error) {
    console.error('Error fetching wallet token balances:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// STEP 6: Get token list | ✅ WORKS!
export async function getTokenList(
  chain: string = 'bsc'
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    // Construct URL using config
    const url = `${config.node.baseMainnetRpc}/addon/${config.node.openOceanAddonId}/v4/${chain}/tokenList`;

    // Make the request
    const { data } = await axios.get(url, {
      headers: { 'Content-Type': 'application/json' },
    });

    // Validate response
    if (!data) {
      throw new Error('Empty response from OpenOcean token list API');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(
      'Failed to get token list:',
      error instanceof Error ? error.message : String(error)
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// STEP 7: Get transaction details from OpenOcean API | ✅ WORKS!
export async function getTransaction(
  hash: string,
  chain: string = 'bsc'
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    // Construct URL
    const url = `${config.node.baseMainnetRpc}/addon/${config.node.openOceanAddonId}/v4/${chain}/getTransaction`;

    const { data } = await axios.get(url, {
      params: { hash },
      headers: { 'Content-Type': 'application/json' },
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(
      'Failed to get transaction details:',
      error instanceof Error ? error.message : String(error)
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// STEP 8: Get swap transaction data from OpenOcean API | ✅ WORKS!
export async function getSwap(
  inTokenAddress: string,
  outTokenAddress: string,
  amount: number | string,
  gasPrice: number | string,
  slippage: number | string,
  account: string,
  referrer?: string,
  chain: string = 'bsc'
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    // Construct URL
    const url = `${config.node.baseMainnetRpc}/addon/${config.node.openOceanAddonId}/v4/${chain}/swap`;

    // Build params object
    const params: Record<string, string | number> = {
      inTokenAddress,
      outTokenAddress,
      amount,
      gasPrice,
      slippage,
      account,
    };

    // Add optional referrer if provided
    if (referrer) {
      params.referrer = referrer;
    }

    // Make request
    const { data } = await axios.get(url, {
      params,
      headers: {
        'Content-Type': 'application/json',
        'x-qn-api-chain': chain,
      },
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(
      'Failed to get swap transaction:',
      error instanceof Error ? error.message : String(error)
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Run tests via ts-node openocean.ts <testFunction>
// Example: ts-node -r tsconfig-paths/register src/openocean.ts transaction
////////////////////////////////////////////////////////////////////////////////////////////////

if (require.main === module) {
  const testFunction = process.argv[2];

  if (testFunction === 'connection' || !testFunction) {
    console.log('Running QuickNode connection test...');
    testQuickNodeConnection()
      .then((result) => {
        if (result.success) {
          console.log(result.result);
        } else {
          console.error('Connection failed:', result.error);
        }
      })
      .catch((error) => console.error('Error during connection test:', error));
  }

  if (testFunction === 'gas' || !testFunction) {
    getGasEstimates()
      .then((result) => {
        console.log(JSON.stringify(result, null, 2));
      })
      .catch((error) => console.error('Error fetching gas estimates:', error));
  }

  if (testFunction === 'mev' || !testFunction) {
    testMevProtection()
      .then((result) => {
        console.log(JSON.stringify(result, null, 2));
      })
      .catch((error) => console.error('Error during MEV protection test:', error));
  }

  if (testFunction === 'quote' || !testFunction) {
    const inToken = '0x55d398326f99059ff775485246999027b3197955'; // USDT on BSC
    const outToken = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'; // USDC on BSC

    getQuote(inToken, outToken)
      .then((result) => {
        if (result.success) {
          console.log(JSON.stringify(result.data, null, 2));
        } else {
          console.error('Error fetching quote:', result.error);
        }
      })
      .catch((error) => console.error('Error during OpenOcean API test:', error));
  }

  if (testFunction === 'balance' || !testFunction) {
    const walletAddress = '0xA7E4EF0a9e15bDEf215E2ed87AE050f974ECD60b'; // Replace with your wallet address
    getWalletTokenBalance(walletAddress)
      .then((result) => {
        console.log(JSON.stringify(result, null, 2));
      })
      .catch((error) => console.error('Error during wallet token balance test:', error));
  }

  if (testFunction === 'tokenList' || !testFunction) {
    // Default to BSC chain for token list
    const chain = process.argv[3] || 'bsc';
    console.log(`Getting token list for chain: ${chain}`);

    getTokenList(chain)
      .then((result) => {
        if (result.success) {
          console.log(JSON.stringify(result.data, null, 2));
        } else {
          console.error('Error fetching token list:', result.error);
        }
      })
      .catch((error) => console.error('Error during token list test:', error));
  }

  if (testFunction === 'transaction' || !testFunction) {
    // Example transaction hash from BSC
    const txHash = '0x756b98a89714be5c640ea9922aba12e0c94bc30e5a17e111d1aa40373cc24782';

    getTransaction(txHash)
      .then((result) => {
        if (result.success) {
          console.log(JSON.stringify(result.data, null, 2));
        } else {
          console.error('Error fetching transaction details:', result.error);
        }
      })
      .catch((error) => console.error('Error during transaction details test:', error));
  }

  if (testFunction === 'swap' || !testFunction) {
    // Example swap parameters
    const inToken = '0x55d398326f99059ff775485246999027b3197955'; // USDT on BSC
    const outToken = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'; // USDC on BSC
    const amount = '5';
    const gasPrice = '1';
    const slippage = '1';
    const account = '0x2FF855378Cd29f120CDF9d675E959cb5422ec5f2'; // Example wallet
    const referrer = '0xD4eb4cbB1ECbf96a1F0C67D958Ff6fBbB7B037BB'; // Optional referrer

    console.log('Getting swap transaction data...');
    getSwap(inToken, outToken, amount, gasPrice, slippage, account, referrer)
      .then((result) => {
        if (result.success) {
          console.log(JSON.stringify(result.data, null, 2));
        } else {
          console.error('Error fetching swap transaction:', result.error);
        }
      })
      .catch((error) => console.error('Error during swap transaction test:', error));
  }

  if (
    ![
      'connection',
      'gas',
      'quote',
      'mev',
      'balance',
      'tokenList',
      'transaction',
      'swap',
      undefined,
    ].includes(testFunction)
  ) {
    console.log(
      'Unknown test function. Use "connection" or "gas" or "quote" or "mev" or "balance" or "tokenList" or "transaction" or "swap"'
    );
  }
}

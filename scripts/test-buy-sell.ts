import { NeuroDexApi } from '../src/services/engine/neurodex';
import logger from '../src/config/logger';

// Test wallet configuration
const TEST_WALLET = {
  address: '0x...', // Replace with your test wallet address
  privateKey: '0x...', // Add your private key here. Keep "0x" prefix!!
};

// Test token addresses on Base
const TEST_TOKENS = {
  USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC on Base
  WETH: '0x4200000000000000000000000000000000000006', // WETH on Base
};

async function testBuy(): Promise<void> {
  logger.info('Testing buy functionality...');

  const neurodex = new NeuroDexApi();

  try {
    // Buy 10 USDC worth of WETH
    const buyResult = await neurodex.buy({
      toTokenAddress: TEST_TOKENS.USDC,
      fromAmount: '0.0001', // In ETH
      slippage: '1',
      gasPriority: 'standard',
      walletAddress: TEST_WALLET.address,
      privateKey: TEST_WALLET.privateKey,
      referrer: '0x588AE3D9Df7DB26D9e773F34AbB548B0302B7d3B',
    });

    if (buyResult.success) {
      logger.info('Buy successful!');
      logger.info('Transaction hash:', buyResult.data?.txHash);
      logger.info('Input amount:', buyResult.data?.inAmount);
      logger.info('Output amount:', buyResult.data?.outAmount);
      logger.info('Price impact:', buyResult.data?.price_impact);
    } else {
      logger.error('Buy failed:', buyResult.error);
    }
  } catch (error) {
    logger.error('Error during buy test:', error);
  }
}

async function testSell(): Promise<void> {
  logger.info('Testing sell functionality...');

  const neurodex = new NeuroDexApi();

  try {
    // Sell 0.25 USDC
    const sellResult = await neurodex.sell({
      fromTokenAddress: TEST_TOKENS.USDC,
      fromAmount: 0.25, // 0.25 USDC
      slippage: '1',
      gasPriority: 'standard',
      walletAddress: TEST_WALLET.address,
      privateKey: TEST_WALLET.privateKey,
      referrer: '0x588AE3D9Df7DB26D9e773F34AbB548B0302B7d3B',
    });

    if (sellResult.success) {
      logger.info('Sell successful!');
      logger.info('Transaction hash:', sellResult.data?.txHash);
      logger.info('Input amount:', sellResult.data?.inAmount);
      logger.info('Output amount:', sellResult.data?.outAmount);
      logger.info('Price impact:', sellResult.data?.price_impact);
    } else {
      logger.error('Sell failed:', sellResult.error);
    }
  } catch (error) {
    logger.error('Error during sell test:', error);
  }
}

async function main(): Promise<void> {
  // Check if wallet is configured
  if (TEST_WALLET.address === '0x...' || TEST_WALLET.privateKey === '0x...') {
    logger.error('Please configure your test wallet address and private key in the script');
    process.exit(1);
  }

  // Run tests
  logger.info('Starting NeuroDex API tests...');

  // Test buy functionality
  await testBuy();

  // Wait for 5 seconds between tests
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Test sell functionality
  await testSell();

  logger.info('Tests completed!');
}

// Run the tests
main().catch(logger.error);

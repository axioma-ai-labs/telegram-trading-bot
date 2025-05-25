import { NeuroDexApi } from '../src/services/engine/neurodex';

// Test wallet configuration
const TEST_WALLET = {
  address: process.env.TEST_WALLET_ADDRESS || '0x...',
  privateKey: process.env.TEST_WALLET_PRIVATE_KEY || '0x...',
};

// Test token addresses on Base
const TEST_TOKENS = {
  USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC on Base
  WETH: '0x4200000000000000000000000000000000000006', // WETH on Base
};

async function testBuy(): Promise<void> {
  console.log('Testing buy functionality...');

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
      console.log('Buy successful!');
      console.log('Transaction hash:', buyResult.data?.txHash);
      console.log('Input amount:', buyResult.data?.inAmount);
      console.log('Output amount:', buyResult.data?.outAmount);
      console.log('Price impact:', buyResult.data?.price_impact);
    } else {
      console.error('Buy failed:', buyResult.error);
    }
  } catch (error) {
    console.error('Error during buy test:', error);
  }
}

async function testSell(): Promise<void> {
  console.log('Testing sell functionality...');

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
      console.log('Sell successful!');
      console.log('Transaction hash:', sellResult.data?.txHash);
      console.log('Input amount:', sellResult.data?.inAmount);
      console.log('Output amount:', sellResult.data?.outAmount);
      console.log('Price impact:', sellResult.data?.price_impact);
    } else {
      console.error('Sell failed:', sellResult.error);
    }
  } catch (error) {
    console.error('Error during sell test:', error);
  }
}

async function main(): Promise<void> {
  // Check if wallet is configured
  if (TEST_WALLET.address === '0x...' || TEST_WALLET.privateKey === '0x...') {
    console.error('Please configure your test wallet address and private key in the script');
    process.exit(1);
  }

  // Run tests
  console.log('Starting NeuroDex API tests...');

  // Test buy functionality
  await testBuy();

  // Wait for 5 seconds between tests
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Test sell functionality
  await testSell();

  console.log('Tests completed!');
}

// Run the tests
main().catch(console.error);

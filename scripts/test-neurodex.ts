import { NeuroDexApi } from '../src/services/engine/neurodex';

// Test wallet configuration
// const TEST_WALLET = {
//   address: '0x...', // Replace with your test wallet address
//   privateKey: '0x...', // Replace with your test wallet private key
// };

const TEST_WALLET = {
  address: '0x6777aadba6ebe5f6bafee5c1bcfa46c4ed34b4b1',
  privateKey: '2b2b07c796791efea8b7b651f1af0aa551b3031af32bf0cfec6252fa58814ebe',
};

// Test token addresses on Base
const TEST_TOKENS = {
  BRO: '0xc796E499CC8f599A2a8280825d8BdA92F7a895e0', // BRO on Base
  WETH: '0x4200000000000000000000000000000000000006', // WETH on Base
};

async function testBuy(): Promise<void> {
  console.log('Testing buy functionality...');

  const neurodex = new NeuroDexApi();

  try {
    // Buy 10 USDC worth of WETH
    const buyResult = await neurodex.buy({
      tokenAddress: TEST_TOKENS.BRO,
      amount: '10000000', // 10 BRO (6 decimals)
      slippage: '1',
      walletAddress: TEST_WALLET.address,
      privateKey: TEST_WALLET.privateKey,
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
    // Sell 0.01 WETH
    const sellResult = await neurodex.sell({
      tokenAddress: TEST_TOKENS.BRO,
      amount: '10000000', // 10 BRO (6 decimals)
      slippage: '1',
      walletAddress: TEST_WALLET.address,
      privateKey: TEST_WALLET.privateKey,
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

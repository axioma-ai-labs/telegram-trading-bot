import { NeuroDexApi } from '../src/services/engine/neurodex';
import Web3 from 'web3';
import { config } from '../src/config/config';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

async function testCreateLimitOrder(): Promise<void> {
  console.log('Testing limit order creation...');

  const neurodex = new NeuroDexApi();

  try {
    // Set the expiration time to 1 day
    const expireTime = '1D';

    // Create a limit order to sell USDC for WETH
    // Example: Creating a limit order to sell 1 USDC for 0.00025 WETH
    const limitOrderResult = await neurodex.createLimitOrder(
      {
        makerTokenAddress: TEST_TOKENS.USDC, // Token to sell
        makerTokenDecimals: 6, // USDC has 6 decimals
        takerTokenAddress: TEST_TOKENS.WETH, // Token to buy
        takerTokenDecimals: 18, // WETH has 18 decimals
        makerAmount: '1000000', // 1 USDC with decimals
        takerAmount: '250000000000000', // 0.00025 WETH with decimals
        expire: expireTime,
        slippage: 1,
        gasPriority: 'standard',
        walletAddress: TEST_WALLET.address,
        privateKey: TEST_WALLET.privateKey,
        referrer: '0x588AE3D9Df7DB26D9e773F34AbB548B0302B7d3B',
      },
      'base'
    );

    if (limitOrderResult.success) {
      console.log('Limit order created successfully!');
      console.log('Order data:', JSON.stringify(limitOrderResult.data, null, 2));
    } else {
      console.error('Limit order creation failed:', limitOrderResult.error);
    }
  } catch (error) {
    console.error('Error during limit order test:', error);
  }
}

async function testGetLimitOrders(): Promise<void> {
  console.log('Testing get limit orders...');

  const neurodex = new NeuroDexApi();

  try {
    const limitOrders = await neurodex.getLimitOrders(
      {
        address: TEST_WALLET.address,
        statuses: [1, 3, 5],
      },
      'base'
    );

    if (limitOrders.success) {
      console.log('Limit orders retrieved successfully!');
      console.log(`Found ${limitOrders.data?.length || 0} limit orders:`);

      if (limitOrders.data && limitOrders.data.length > 0) {
        limitOrders.data.forEach((order, index) => {
          console.log(`\nOrder #${index + 1}:`);
          console.log(`Hash: ${order.orderHash}`);
          console.log(`Status: ${order.status}`);
          console.log(
            `Maker Asset: ${order.data.makerAssetSymbol} (${order.data.makerAssetAmount})`
          );
          console.log(
            `Taker Asset: ${order.data.takerAssetSymbol} (${order.data.takerAssetAmount})`
          );
          console.log(`Created: ${new Date(order.data.createDateTime * 1000).toLocaleString()}`);
          console.log(`Expires: ${new Date(order.data.expiry * 1000).toLocaleString()}`);
        });
      }
    } else {
      console.error('Failed to retrieve limit orders:', limitOrders.error);
    }
  } catch (error) {
    console.error('Error retrieving limit orders:', error);
  }
}

async function testCancelLimitOrder(orderHash: string): Promise<void> {
  console.log(`Testing cancel limit order for hash: ${orderHash}`);

  const neurodex = new NeuroDexApi();

  try {
    // First, get the order details to pass to cancel function
    const limitOrders = await neurodex.getLimitOrders(
      {
        address: TEST_WALLET.address,
        statuses: [1, 3, 5],
      },
      'base'
    );

    if (!limitOrders.success || !limitOrders.data || limitOrders.data.length === 0) {
      console.error('Failed to retrieve limit orders or no orders found');
      return;
    }

    // Find the order with the provided hash
    const orderToCancel = limitOrders.data[0];

    if (!orderToCancel) {
      console.error(`Order with hash ${orderHash} not found`);
      return;
    }

    // Cancel the limit order
    const cancelResult = await neurodex.cancelLimitOrder(
      {
        orderHash: orderToCancel.orderHash,
        orderData: orderToCancel.data,
      },
      'base'
    );

    if (cancelResult.success) {
      console.log('Limit order cancelled successfully!');
      console.log('Cancel result:', cancelResult.data);
    } else {
      console.error('Failed to cancel limit order:', cancelResult.error);
    }
  } catch (error) {
    console.error('Error cancelling limit order:', error);
  }
}

async function main(): Promise<void> {
  // Check if wallet is configured
  if (TEST_WALLET.address === '' || TEST_WALLET.privateKey === '') {
    console.error('Please configure your test wallet address and private key in the script');
    process.exit(1);
  }

  // Run tests
  console.log('Starting NeuroDex Limit Order API tests...');

  // Test 1: Create a limit order
  await testCreateLimitOrder();

  // Wait for 3 seconds
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Test 2: Get all limit orders
  await testGetLimitOrders();

  // Uncomment and add an order hash to test cancellation
  // Wait for 3 seconds
  // await new Promise(resolve => setTimeout(resolve, 3000));
  // await testCancelLimitOrder('ORDER_HASH_HERE');

  console.log('Tests completed!');
}

// Run the tests
main().catch(console.error);

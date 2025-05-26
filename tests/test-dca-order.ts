import dotenv from 'dotenv';

import { NeuroDexApi } from '../src/services/engine/neurodex';

// Load environment variables
dotenv.config();

// Test wallet configuration
const TEST_WALLET = {
  address: '0xd08EB3DF731C151f2ABC33b19e450Cd3f1Eb9f20',
  privateKey: '0xdcffd7f29aa6686dc0ac7bfed114762a033323f69b810673a3b46590730b94a9',
};

// Test token addresses on Base
const TEST_TOKENS = {
  USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC on Base
  WETH: '0x4200000000000000000000000000000000000006', // WETH on Base
};

async function testCreateDcaOrder(): Promise<void> {
  console.log('Testing DCA order creation...');

  const neurodex = new NeuroDexApi();

  try {
    // Create a DCA order to buy WETH with USDC
    // Example: Creating a DCA order to spend 10 USDC over 5 intervals (2 USDC each)
    const dcaOrderResult = await neurodex.createDcaOrder(
      {
        makerTokenAddress: TEST_TOKENS.USDC, // Token to spend (USDC)
        makerTokenDecimals: 6, // USDC has 6 decimals
        takerTokenAddress: TEST_TOKENS.WETH, // Token to buy (WETH)
        takerTokenDecimals: 18, // WETH has 18 decimals
        makerAmount: '10000000', // 10 USDC with decimals
        time: 3600, // 1 hour intervals
        times: 5, // 5 intervals (2 USDC per interval)
        minPrice: '0.9', // Optional: 10% below current price
        maxPrice: '1.1', // Optional: 10% above current price
        slippage: 1,
        gasPriority: 'standard',
        walletAddress: TEST_WALLET.address,
        privateKey: TEST_WALLET.privateKey,
        referrer: '0x588AE3D9Df7DB26D9e773F34AbB548B0302B7d3B',
      },
      'base'
    );

    if (dcaOrderResult.success) {
      console.log('DCA order created successfully!');
      console.log('Order data:', JSON.stringify(dcaOrderResult.data, null, 2));
    } else {
      console.error('DCA order creation failed:', dcaOrderResult.error);
    }
  } catch (error) {
    console.error('Error during DCA order test:', error);
  }
}

async function testGetDcaOrders(): Promise<void> {
  console.log('Testing get DCA orders...');

  const neurodex = new NeuroDexApi();

  try {
    const dcaOrders = await neurodex.getDcaOrders(
      {
        address: TEST_WALLET.address,
        statuses: [1, 2, 3, 4, 5, 6, 7], // Get all orders regardless of status
        limit: 100,
      },
      'base'
    );

    if (dcaOrders.success) {
      console.log('DCA orders retrieved successfully!');
      console.log(`Found ${dcaOrders.data?.length || 0} DCA orders:`);

      if (dcaOrders.data && dcaOrders.data.length > 0) {
        dcaOrders.data.forEach((order, index) => {
          console.log(`\nOrder #${index + 1}:`);
          console.log(`Hash: ${order.orderHash}`);
          console.log(`Status: ${order.status}`);
          console.log(`Maker Asset: ${order.data.makerAssetSymbol} (${order.data.makingAmount})`);
          console.log(`Taker Asset: ${order.data.takerAssetSymbol} (${order.data.takingAmount})`);
          console.log(`Created: ${order.createDateTime}`);
          console.log(`Expires: ${order.expireTime}`);
          console.log(`Interval: ${order.time} seconds`);
          console.log(`Total Intervals: ${order.times}`);
          console.log(`Completed Intervals: ${order.have_filled || 0}`);
          if (order.minPrice) console.log(`Min Price: ${order.minPrice}`);
          if (order.maxPrice) console.log(`Max Price: ${order.maxPrice}`);
        });
      }
    } else {
      console.error('Failed to retrieve DCA orders:', dcaOrders.error);
    }
  } catch (error) {
    console.error('Error retrieving DCA orders:', error);
  }
}

async function testCancelDcaOrder(): Promise<void> {
  try {
    const neurodex = new NeuroDexApi();
    // First, get the order details to pass to cancel function
    const dcaOrders = await neurodex.getDcaOrders(
      {
        address: TEST_WALLET.address,
        statuses: [1, 5], // Get only active and pending orders
      },
      'base'
    );

    if (!dcaOrders.success || !dcaOrders.data || dcaOrders.data.length === 0) {
      console.error('Failed to retrieve DCA orders or no orders found');
      return;
    }

    // Get the first active order
    const orderToCancel = dcaOrders.data[0];

    if (!orderToCancel) {
      console.error(`No active DCA orders found`);
      return;
    }

    // Cancel the DCA order
    const cancelResult = await neurodex.cancelDcaOrder(
      {
        orderHash: orderToCancel.orderHash,
        orderData: orderToCancel.data,
        slippage: 1,
        gasPriority: 'standard',
        walletAddress: TEST_WALLET.address,
        privateKey: TEST_WALLET.privateKey,
        referrer: '0x588AE3D9Df7DB26D9e773F34AbB548B0302B7d3B',
      },
      'base'
    );

    if (cancelResult.success) {
      console.log('DCA order cancelled successfully!');
      console.log('Cancel result:', cancelResult.data);
    } else {
      console.error('Failed to cancel DCA order:', cancelResult.error);
    }
  } catch (error) {
    console.error('Error cancelling DCA order:', error);
  }
}

async function main(): Promise<void> {
  // Check if wallet is configured
  if (TEST_WALLET.address === '' || TEST_WALLET.privateKey === '') {
    console.error('Please configure your test wallet address and private key in .env.local');
    process.exit(1);
  }

  // Run tests
  console.log('Starting NeuroDex DCA Order API tests...');

  // Test 1: Create a DCA order
  await testCreateDcaOrder();

  // Wait for 3 seconds
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Test 2: Get all DCA orders
  await testGetDcaOrders();

  // Wait for 3 seconds
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Test 3: Cancel a DCA order
  await testCancelDcaOrder();

  console.log('Tests completed!');
}

// Run the tests
main().catch(console.error);

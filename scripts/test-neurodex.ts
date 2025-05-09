import { NeuroDexApi } from '../src/services/engine/neurodex';
import { parseUnits } from 'ethers';

async function main(): Promise<void> {
  const api = new NeuroDexApi();
  const testAddress = '0x2FF855378Cd29f120CDF9d675E959cb5422ec5f2'; // Example wallet

  console.log('Testing NeuroDex API...\n');

  // Test getTokenInfo
  console.log('1. Testing getTokenInfo...');
  const tokenAddress = '0x4200000000000000000000000000000000000006'; // WETH on Base
  const tokenInfo = await api.getTokenInfo(tokenAddress);
  console.log('Token Info:', JSON.stringify(tokenInfo, null, 2), '\n');

  // Test buy
  console.log('2. Testing buy...');
  const buyResult = await api.buy({
    tokenAddress,
    amount: parseUnits('1', 18).toString(), // 1 token
    nativeAmount: parseUnits('0.1', 18).toString(), // 0.1 ETH
    account: testAddress,
    slippage: 1, // 1%
  });
  console.log('Buy Result:', JSON.stringify(buyResult, null, 2), '\n');

  // Test sell
  console.log('3. Testing sell...');
  const sellResult = await api.sell({
    tokenAddress,
    amount: parseUnits('1', 18).toString(), // 1 token
    minNativeAmount: parseUnits('0.1', 18).toString(), // 0.1 ETH
    account: testAddress,
    slippage: 1, // 1%
  });
  console.log('Sell Result:', JSON.stringify(sellResult, null, 2), '\n');

  // Test createDca
  console.log('4. Testing createDca...');
  const dcaResult = await api.createDca({
    tokenAddress,
    amount: parseUnits('1', 18).toString(), // 1 token per interval
    totalAmount: parseUnits('10', 18).toString(), // 10 ETH total
    intervals: 10, // 10 intervals
    intervalDuration: 3600, // 1 hour between intervals
    account: testAddress,
    slippage: 1, // 1%
  });
  console.log('DCA Result:', JSON.stringify(dcaResult, null, 2), '\n');

  // Test createLimitOrder
  console.log('5. Testing createLimitOrder...');
  const limitOrderResult = await api.createLimitOrder({
    tokenAddress,
    amount: parseUnits('1', 18).toString(), // 1 token
    targetPrice: '0.1', // 0.1 ETH per token
    account: testAddress,
    slippage: 1, // 1%
  });
  console.log('Limit Order Result:', JSON.stringify(limitOrderResult, null, 2), '\n');

  // Test getDcaOrders
  console.log('6. Testing getDcaOrders...');
  const dcaOrders = await api.getDcaOrders(testAddress);
  console.log('DCA Orders:', JSON.stringify(dcaOrders, null, 2), '\n');

  // Test getLimitOrders
  console.log('7. Testing getLimitOrders...');
  const limitOrders = await api.getLimitOrders(testAddress);
  console.log('Limit Orders:', JSON.stringify(limitOrders, null, 2), '\n');

  // If we have any orders, test cancellation
  if (dcaOrders.success && dcaOrders.data && dcaOrders.data.length > 0) {
    console.log('8. Testing cancelDca...');
    const cancelDcaResult = await api.cancelDca(dcaOrders.data[0].id);
    console.log('Cancel DCA Result:', JSON.stringify(cancelDcaResult, null, 2), '\n');
  }

  if (limitOrders.success && limitOrders.data && limitOrders.data.length > 0) {
    console.log('9. Testing cancelLimitOrder...');
    const cancelLimitOrderResult = await api.cancelLimitOrder(limitOrders.data[0].id);
    console.log(
      'Cancel Limit Order Result:',
      JSON.stringify(cancelLimitOrderResult, null, 2),
      '\n'
    );
  }
}

// Run the tests
main().catch((error) => {
  console.error('Error running tests:', error);
  process.exit(1);
});

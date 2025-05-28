import dotenv from 'dotenv';

import { NeuroDexApi } from '../src/services/engine/neurodex';

// Load environment variables
dotenv.config();

// Test wallet configuration
const TEST_WALLET = {
  address: process.env.TEST_WALLET_ADDRESS || '0x...',
  privateKey: process.env.TEST_WALLET_PRIVATE_KEY || '0x...',
};

// Test recipient address (you can change this to any valid address)
const TEST_RECIPIENT =
  process.env.TEST_RECIPIENT_ADDRESS || '0x910fc9C441CB2d49a6dd1cC0ED5D382730E08dD8';

async function testWithdrawal(): Promise<void> {
  console.log('Testing withdrawal functionality...');

  const neurodex = new NeuroDexApi();

  try {
    // Check sender's balance first
    const balance = await neurodex.viemService.getNativeBalance(
      TEST_WALLET.address as `0x${string}`
    );
    console.log(`Sender balance: ${balance} ETH`);

    if (parseFloat(balance) < 0.001) {
      console.error('Insufficient balance for withdrawal test. Need at least 0.001 ETH');
      return;
    }

    // Withdraw 0.0001 ETH to the recipient
    const withdrawResult = await neurodex.withdraw(
      {
        toAddress: TEST_RECIPIENT,
        amount: 0.0001, // 0.0001 ETH
        slippage: 1, // Not used for withdrawal but required by interface
        gasPriority: 'standard',
        walletAddress: TEST_WALLET.address,
        privateKey: TEST_WALLET.privateKey,
        referrer: '0x588AE3D9Df7DB26D9e773F34AbB548B0302B7d3B',
      },
      'base'
    );

    if (withdrawResult.success) {
      console.log('Withdrawal successful!');
      console.log('Transaction hash:', withdrawResult.data?.txHash);
      console.log('Amount withdrawn (wei):', withdrawResult.data?.amount);
      console.log('From address:', withdrawResult.data?.fromAddress);
      console.log('To address:', withdrawResult.data?.toAddress);
      console.log('Gas used:', withdrawResult.data?.gasUsed);
    } else {
      console.error('Withdrawal failed:', withdrawResult.error);
    }
  } catch (error) {
    console.error('Error during withdrawal test:', error);
  }
}

async function testGetBalance(): Promise<void> {
  console.log('Testing balance retrieval...');

  const neurodex = new NeuroDexApi();

  try {
    const balance = await neurodex.viemService.getNativeBalance(
      TEST_WALLET.address as `0x${string}`
    );
    console.log(`Wallet balance: ${balance} ETH`);

    const recipientBalance = await neurodex.viemService.getNativeBalance(
      TEST_RECIPIENT as `0x${string}`
    );
    console.log(`Recipient balance: ${recipientBalance} ETH`);
  } catch (error) {
    console.error('Error retrieving balance:', error);
  }
}

async function main(): Promise<void> {
  // Check if wallet is configured
  if (TEST_WALLET.address === '0x...' || TEST_WALLET.privateKey === '0x...') {
    console.error('Please configure your test wallet address and private key in .env');
    process.exit(1);
  }

  // Run tests
  console.log('Starting NeuroDex Withdrawal API tests...');

  // Test 1: Get balances
  await testGetBalance();

  // Wait for 3 seconds
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Test 2: Perform withdrawal
  await testWithdrawal();

  // Wait for 3 seconds
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Test 3: Check balances again
  console.log('\nChecking balances after withdrawal...');
  await testGetBalance();

  console.log('Tests completed!');
}

// Run the tests
main().catch(console.error);

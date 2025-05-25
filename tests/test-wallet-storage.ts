import { NeuroDexApi } from '../src/services/engine/neurodex';
import { PrivateStorageService } from '../src/services/supabase/privateKeys';

async function testWalletStorage(): Promise<void> {
  try {
    console.log('🔑 Testing wallet creation and private key storage...\n');

    // Initialize NeuroDex API
    const neurodex = new NeuroDexApi();

    // 1. Create a new wallet
    console.log('Creating new wallet...');
    const wallet = await neurodex.createWallet();
    if (!wallet) {
      throw new Error('Failed to create wallet');
    }
    console.log('✅ Wallet created successfully:');
    console.log(`Address: ${wallet.address}`);
    console.log(`Private Key: ${wallet.privateKey}\n`);

    // 2. Retrieve the private key using the wallet address
    console.log('Retrieving private key from storage...');
    const retrievedKey = await PrivateStorageService.getPrivateKey(wallet.address);
    if (!retrievedKey) {
      throw new Error('Failed to retrieve private key');
    }
    console.log('✅ Private key retrieved successfully');
    console.log(`Retrieved Key: ${retrievedKey}\n`);

    // 3. Verify the keys match
    const keysMatch = wallet.privateKey === retrievedKey;
    console.log('Verifying keys match...');
    if (keysMatch) {
      console.log('✅ Keys match! Storage and retrieval working correctly\n');
    } else {
      throw new Error('❌ Keys do not match! Storage or retrieval error');
    }

    // 4. Test key deletion
    console.log('Testing key deletion...');
    const deleted = await PrivateStorageService.deletePrivateKey(wallet.address);
    if (!deleted) {
      throw new Error('Failed to delete private key');
    }
    console.log('✅ Private key deleted successfully');

    // 5. Verify key is deleted
    const deletedKey = await PrivateStorageService.getPrivateKey(wallet.address);
    if (deletedKey === null) {
      console.log('✅ Verified key deletion: Key no longer exists in storage\n');
    } else {
      throw new Error('❌ Key still exists after deletion!');
    }

    console.log('🎉 All tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the test
testWalletStorage().catch(console.error);

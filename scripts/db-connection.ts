import 'dotenv/config';
import { UserService } from '../src/services/db/user.service';

async function testDatabaseConnection(): Promise<void> {
  try {
    console.log('Testing database connection...');

    console.log('Database URL:', process.env.DATABASE_URL);

    // Test user creation
    const testUser = await UserService.upsertUser('123456789', {
      username: 'test_user',
      firstName: 'Test',
      lastName: 'User',
    });
    console.log('✅ User created/updated:', testUser);

    // Test user retrieval
    const retrievedUser = await UserService.getUserByTelegramId('123456789');
    console.log('✅ User retrieved:', retrievedUser);

    // Test wallet addition
    const wallet = await UserService.addWallet(testUser.id, '0x123...', 'ethereum');
    console.log('✅ Wallet added:', wallet);

    // Test settings update
    const settings = await UserService.updateSettings(testUser.id, {
      notifications: true,
      autoTrade: false,
      maxTradeAmount: 100,
    });
    console.log('✅ Settings updated:', settings);

    console.log('✅ All database operations completed successfully!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    process.exit(0);
  }
}

testDatabaseConnection();

import 'dotenv/config';
import { UserService } from '../src/services/db/user.service';
import { PrismaClient } from '../node_modules/.prisma/client';
import logger from '../src/config/logger';

const prisma = new PrismaClient();

async function testDatabaseConnection(): Promise<void> {
  try {
    logger.info('Testing database connection...');

    logger.info('Database URL:', process.env.DATABASE_URL);

    // Test user creation
    const testUser = await UserService.upsertUser('123456789', {
      username: 'test_user',
      firstName: 'Test',
      lastName: 'User',
    });
    logger.info('✅ User created/updated:', testUser);

    // Test user retrieval
    const retrievedUser = await UserService.getUserByTelegramId('123456789');
    logger.info('✅ User retrieved:', retrievedUser);

    // Test wallet addition
    const wallet = await UserService.addWallet(testUser.id, '0x123...', 'ethereum');
    logger.info('✅ Wallet added:', wallet);

    // Test settings update
    const settings = await UserService.updateSettings(testUser.id, {
      notifications: true,
      autoTrade: false,
      maxTradeAmount: 100,
    });
    logger.info('✅ Settings updated:', settings);

    logger.info('✅ All database operations completed successfully!');
  } catch (error) {
    logger.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testDatabaseConnection();

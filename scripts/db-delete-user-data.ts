import 'dotenv/config';
import { PrismaClient } from '../node_modules/.prisma/client';
import logger from '../src/config/logger';

const prisma = new PrismaClient();

/**
 * Deletes all data associated with a user
 * @param userId - The ID of the user to delete
 * @returns Promise<void>
 */
async function deleteUserData(userId: string): Promise<void> {
  try {
    logger.info(`Starting deletion of user data for ID: ${userId}`);

    // Delete all trades associated with user's wallets
    const deletedTrades = await prisma.trade.deleteMany({
      where: {
        userId: userId,
      },
    });
    logger.info(`✅ Deleted ${deletedTrades.count} trades`);

    // Delete all wallets associated with the user
    const deletedWallets = await prisma.wallet.deleteMany({
      where: {
        userId: userId,
      },
    });
    logger.info(`✅ Deleted ${deletedWallets.count} wallets`);

    // Delete user's settings
    const deletedSettings = await prisma.settings.deleteMany({
      where: {
        userId: userId,
      },
    });
    logger.info(`✅ Deleted ${deletedSettings.count} settings records`);

    // Delete user's referral stats
    const deletedStats = await prisma.referralStats.deleteMany({
      where: {
        userId: userId,
      },
    });
    logger.info(`✅ Deleted ${deletedStats.count} referral stats records`);

    // Update any users who were referred by this user
    const updatedReferrals = await prisma.user.updateMany({
      where: {
        referredById: userId,
      },
      data: {
        referredById: null,
      },
    });
    logger.info(`✅ Updated ${updatedReferrals.count} referral relationships`);

    // Finally, delete the user
    const deletedUser = await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    logger.info(`✅ Deleted user: ${deletedUser.telegramId}`);

    logger.info('✅ All user data deleted successfully');
  } catch (error) {
    logger.error('❌ Error deleting user data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  logger.error('❌ Please provide a user ID as a command line argument');
  logger.error('Usage: run CMD="scripts/db-delete-user-data.ts <userId>"');
  process.exit(1);
}

// Execute deletion
deleteUserData(userId)
  .then(() => {
    logger.info('✅ Deletion process completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Deletion process failed:', error);
    process.exit(1);
  });

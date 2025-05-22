import 'dotenv/config';
import { PrismaClient } from '@prisma/client/edge';

const prisma = new PrismaClient();

/**
 * Deletes all data associated with a user
 * @param userId - The ID of the user to delete
 * @returns Promise<void>
 */
async function deleteUserData(userId: string): Promise<void> {
  try {
    console.log(`Starting deletion of user data for ID: ${userId}`);

    // Delete all trades associated with user's wallets
    const deletedTrades = await prisma.trade.deleteMany({
      where: {
        userId: userId,
      },
    });
    console.log(`✅ Deleted ${deletedTrades.count} trades`);

    // Delete all wallets associated with the user
    const deletedWallets = await prisma.wallet.deleteMany({
      where: {
        userId: userId,
      },
    });
    console.log(`✅ Deleted ${deletedWallets.count} wallets`);

    // Delete user's settings
    const deletedSettings = await prisma.settings.deleteMany({
      where: {
        userId: userId,
      },
    });
    console.log(`✅ Deleted ${deletedSettings.count} settings records`);

    // Delete user's referral stats
    const deletedStats = await prisma.referralStats.deleteMany({
      where: {
        userId: userId,
      },
    });
    console.log(`✅ Deleted ${deletedStats.count} referral stats records`);

    // Update any users who were referred by this user
    const updatedReferrals = await prisma.user.updateMany({
      where: {
        referredById: userId,
      },
      data: {
        referredById: null,
      },
    });
    console.log(`✅ Updated ${updatedReferrals.count} referral relationships`);

    // Finally, delete the user
    const deletedUser = await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    console.log(`✅ Deleted user: ${deletedUser.telegramId}`);

    console.log('✅ All user data deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting user data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Please provide a user ID as a command line argument');
  console.error('Usage: run CMD="scripts/db-delete-user-data.ts <userId>"');
  process.exit(1);
}

// Execute deletion
deleteUserData(userId)
  .then(() => {
    console.log('✅ Deletion process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deletion process failed:', error);
    process.exit(1);
  });

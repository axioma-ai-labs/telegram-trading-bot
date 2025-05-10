import { prisma } from './prisma';
import { ReferralStats, User } from '../../../prisma/generated/prisma';

export class ReferralService {
  /**
   * Upsert user's referral code
   *
   * @param userId - The user's ID
   * @param referralCode - The referral code to set
   * @returns The updated user
   */
  static async upsertReferralCode(userId: string, referralCode: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        referralCode,
      },
    });
  }

  /**
   * Get user by referral code
   *
   * @param referralCode - The referral code to lookup
   * @returns The user with the given referral code or null
   */
  static async getUserByReferralCode(referralCode: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { referralCode },
    });
  }

  /**
   * Get referral stats for a user
   *
   * @param userId - The user's ID
   * @returns The user's referral stats
   */
  static async getReferralStats(userId: string): Promise<ReferralStats | null> {
    return prisma.referralStats.findUnique({
      where: { userId },
    });
  }

  /**
   * Initialize or update referral stats for a user
   *
   * @param userId - The user's ID
   * @returns The created or updated referral stats
   */
  static async initializeReferralStats(userId: string): Promise<ReferralStats> {
    return prisma.referralStats.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        feeRate: 0.1,
        totalReferrals: 0,
        totalTrades: 0,
        totalVolume: 0,
        totalEarned: 0,
      },
    });
  }

  /**
   * Link referred user to referrer
   *
   * @param referredUserId - The ID of the user being referred
   * @param referrerId - The ID of the referrer
   * @returns The updated referred user
   */
  static async linkReferral(referredUserId: string, referrerId: string): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { id: referredUserId },
      data: { referredById: referrerId },
    });

    await prisma.referralStats.upsert({
      where: { userId: referrerId },
      update: {
        totalReferrals: { increment: 1 },
      },
      create: {
        userId: referrerId,
        feeRate: 0.1,
        totalReferrals: 1,
        totalTrades: 0,
        totalVolume: 0,
        totalEarned: 0,
      },
    });

    return updatedUser;
  }
}

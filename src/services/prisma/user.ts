/**
 * @category Services
 */

import { prisma } from '@/services/prisma/client';
import { Settings, User, Wallet } from '@prisma/client/edge';

/**
 * Interface for user referral statistics
 */
interface ReferralStats {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  feeRate: number;
  totalReferrals: number;
  totalTrades: number;
  totalVolume: number;
  totalEarned: number;
}

/**
 * User service for managing user accounts, authentication, and profile data.
 * 
 * Provides comprehensive user management functionality including:
 * - User creation and updates from Telegram data
 * - User lookup and authentication
 * - Wallet association and management
 * - Settings management and preferences
 * - Terms and conditions tracking
 * - Referral system integration
 * 
 * All operations use Prisma ORM for type-safe database interactions
 * with automatic relationship handling and data validation.
 * 
 * @example
 * ```typescript
 * // Create or update user from Telegram
 * const user = await UserService.upsertUser('123456789', {
 *   username: 'john_doe',
 *   firstName: 'John',
 *   termsAccepted: true
 * });
 * 
 * // Get user with all related data
 * const userWithData = await UserService.getUserByTelegramId('123456789');
 * if (userWithData) {
 *   console.log(`User has ${userWithData.wallets.length} wallets`);
 * }
 * 
 * // Add wallet to user
 * await UserService.addWallet(user.id, '0x742d35...', 'base');
 * ```
 */
export class UserService {
  /**
   * Creates a new user or updates an existing user from Telegram data.
   * 
   * Uses upsert operation to handle both new user creation and existing user updates.
   * Automatically creates default settings for new users and maintains referral
   * relationships if specified.
   * 
   * @param telegramId - Unique Telegram user ID as string
   * @param data - User data object containing profile and account information
   * @param data.username - Telegram username (optional)
   * @param data.firstName - User's first name (optional)
   * @param data.lastName - User's last name (optional)
   * @param data.termsAccepted - Whether user has accepted terms and conditions
   * @param data.referredById - ID of referring user for referral system
   * @param data.referralCode - User's unique referral code
   * @returns Promise resolving to User object with settings and wallets included
   * @throws Error if database operation fails
   * 
   * @example
   * ```typescript
   * // Create new user with referral
   * const newUser = await UserService.upsertUser('987654321', {
   *   username: 'alice_crypto',
   *   firstName: 'Alice',
   *   termsAccepted: true,
   *   referredById: 'referring-user-id',
   *   referralCode: 'ALICE2024'
   * });
   * 
   * // Update existing user
   * const updatedUser = await UserService.upsertUser('123456789', {
   *   firstName: 'John Updated',
   *   termsAccepted: true
   * });
   * ```
   */
  static async upsertUser(
    telegramId: string,
    data: {
      username?: string;
      firstName?: string;
      lastName?: string;
      termsAccepted?: boolean;
      referredById?: string;
      referralCode?: string;
    }
  ): Promise<User> {
    return prisma.user.upsert({
      where: { telegramId },
      update: data,
      create: {
        telegramId,
        ...data,
        settings: {
          create: {}, // Create default settings
        },
      },
      include: {
        settings: true,
        wallets: true,
      },
    });
  }

  /**
   * Retrieves a user by their Telegram ID with all related data.
   * 
   * Fetches user record including associated wallets, settings, and referral
   * statistics. Returns null if user doesn't exist.
   * 
   * @param telegramId - Telegram user ID to look up
   * @returns Promise resolving to User object with related data, or null if not found
   * 
   * @example
   * ```typescript
   * const user = await UserService.getUserByTelegramId('123456789');
   * 
   * if (user) {
   *   console.log(`Found user: ${user.firstName}`);
   *   console.log(`Wallets: ${user.wallets.length}`);
   *   console.log(`Terms accepted: ${user.termsAccepted}`);
   *   
   *   if (user.referralStats) {
   *     console.log(`Total referrals: ${user.referralStats.totalReferrals}`);
   *   }
   * } else {
   *   console.log('User not found');
   * }
   * ```
   */
  static async getUserByTelegramId(telegramId: string): Promise<
    | (User & {
        wallets: Wallet[];
        settings: Settings | null;
        referralStats: ReferralStats | null;
      })
    | null
  > {
    return prisma.user.findUnique({
      where: { telegramId },
      include: {
        settings: true,
        wallets: true,
        referralStats: true,
      },
    });
  }

  /**
   * Associates a new wallet with a user account.
   * 
   * Creates a new wallet record linked to the specified user. Supports
   * multiple wallets per user and different blockchain networks.
   * 
   * @param userId - Internal user ID (not Telegram ID)
   * @param address - Wallet address (hex format)
   * @param chain - Blockchain network identifier (e.g., 'base', 'ethereum')
   * @returns Promise resolving to created Wallet object
   * @throws Error if user doesn't exist or wallet creation fails
   * 
   * @example
   * ```typescript
   * // Add Base network wallet
   * const wallet = await UserService.addWallet(
   *   user.id,
   *   '0x742d35Cc6Cb3C0532C94c3e66d7E17B9d3d17B9c',
   *   'base'
   * );
   * 
   * console.log(`Created wallet: ${wallet.address}`);
   * ```
   */
  static async addWallet(userId: string, address: string, chain: string): Promise<Wallet> {
    return prisma.wallet.create({
      data: {
        address,
        chain,
        userId,
      },
    });
  }

  /**
   * Updates a user's terms and conditions acceptance status.
   * 
   * @param userId - Internal user ID
   * @param termsAccepted - Whether user has accepted current terms
   * @returns Promise resolving to updated User object
   * @throws Error if user doesn't exist
   * 
   * @example
   * ```typescript
   * await UserService.updateTermsAccepted(user.id, true);
   * console.log('User has accepted terms and conditions');
   * ```
   */
  static async updateTermsAccepted(userId: string, termsAccepted: boolean): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { termsAccepted },
    });
  }

  /**
   * Updates or creates user settings and preferences.
   * 
   * Uses upsert operation to handle both new settings creation and updates
   * to existing settings. Allows partial updates of settings properties.
   * 
   * @param userId - Internal user ID
   * @param settings - Settings object with optional properties to update
   * @param settings.notifications - Enable/disable notifications
   * @param settings.autoTrade - Enable/disable automatic trading features
   * @param settings.maxTradeAmount - Maximum allowed trade amount
   * @returns Promise resolving to updated or created Settings object
   * @throws Error if user doesn't exist
   * 
   * @example
   * ```typescript
   * // Update notification preferences
   * const settings = await UserService.updateSettings(user.id, {
   *   notifications: true,
   *   maxTradeAmount: 1000
   * });
   * 
   * console.log(`Max trade amount: ${settings.maxTradeAmount}`);
   * ```
   */
  static async updateSettings(
    userId: string,
    settings: {
      notifications?: boolean;
      autoTrade?: boolean;
      maxTradeAmount?: number;
    }
  ): Promise<Settings> {
    return prisma.settings.upsert({
      where: { userId },
      update: settings,
      create: {
        userId,
        ...settings,
      },
    });
  }
}

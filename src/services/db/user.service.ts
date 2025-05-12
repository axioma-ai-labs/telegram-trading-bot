import { prisma } from '@/services/db/prisma';
import { Settings, User, Wallet } from '@prisma/client/edge';

export class UserService {
  /**
   * Create or update a user from Telegram data
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
   * Get user by Telegram ID
   */
  static async getUserByTelegramId(telegramId: string): Promise<User | null> {
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
   * Add a wallet to user
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

  static async updateTermsAccepted(userId: string, termsAccepted: boolean): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { termsAccepted },
    });
  }

  /**
   * Update user settings
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

import { prisma } from '@/services/db/prisma';
import { Settings } from '@/generated/prisma';

export class SettingsService {
  /**
   * Get settings for a user
   */
  static async getUserSettings(userId: string): Promise<Settings | null> {
    return prisma.settings.findUnique({
      where: { userId },
    });
  }

  /**
   * Create or update user settings
   */
  static async upsertSettings(
    userId: string,
    data: {
      notifications?: boolean;
      autoTrade?: boolean;
      maxTradeAmount?: number;
    }
  ): Promise<Settings> {
    return prisma.settings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }

  /**
   * Update notification settings
   */
  static async updateNotifications(userId: string, notifications: boolean): Promise<Settings> {
    return prisma.settings.update({
      where: { userId },
      data: { notifications },
    });
  }

  /**
   * Update auto trade settings
   */
  static async updateAutoTrade(userId: string, autoTrade: boolean): Promise<Settings> {
    return prisma.settings.update({
      where: { userId },
      data: { autoTrade },
    });
  }

  /**
   * Update max trade amount
   */
  static async updateMaxTradeAmount(userId: string, maxTradeAmount: number): Promise<Settings> {
    return prisma.settings.update({
      where: { userId },
      data: { maxTradeAmount },
    });
  }
}

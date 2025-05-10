import { prisma } from './prisma';
import { Settings } from '../../../prisma/generated/prisma';

export class SettingsService {
  /**
   * Get settings for a user
   */
  static async getUserSettingsByUserId(userId: string): Promise<Settings | null> {
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
      language?: string;
      autoTrade?: boolean;
      proMode?: boolean;
      gasPriority?: string;
      slippage?: string;
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
   * Update language setting
   */
  static async updateLanguage(userId: string, language: string): Promise<Settings> {
    return prisma.settings.update({
      where: { userId },
      data: { language },
    });
  }

  /**
   * Update auto trade setting
   */
  static async updateAutoTrade(userId: string, autoTrade: boolean): Promise<Settings> {
    return prisma.settings.update({
      where: { userId },
      data: { autoTrade },
    });
  }

  /**
   * Update pro mode setting
   */
  static async updateProMode(userId: string, proMode: boolean): Promise<Settings> {
    return prisma.settings.update({
      where: { userId },
      data: { proMode },
    });
  }

  /**
   * Update gas priority setting
   */
  static async updateGasPriority(userId: string, gasPriority: string): Promise<Settings> {
    return prisma.settings.update({
      where: { userId },
      data: { gasPriority },
    });
  }

  /**
   * Update slippage setting
   */
  static async updateSlippage(userId: string, slippage: string): Promise<Settings> {
    return prisma.settings.update({
      where: { userId },
      data: { slippage },
    });
  }
}

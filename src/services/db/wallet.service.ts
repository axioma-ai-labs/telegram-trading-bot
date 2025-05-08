import { prisma } from '@/services/db/prisma';
import { Wallet } from '@/generated/prisma';

export class WalletService {
  /**
   * Get wallet by address
   */
  static async getWalletByAddress(address: string): Promise<Wallet | null> {
    return prisma.wallet.findUnique({
      where: { address },
      include: {
        user: true,
        trades: true,
      },
    });
  }

  /**
   * Get all wallets for a user
   */
  static async getUserWallets(userId: string): Promise<Wallet[]> {
    return prisma.wallet.findMany({
      where: { userId },
      include: {
        trades: true,
      },
    });
  }

  /**
   * Create a new wallet
   */
  static async createWallet(
    userId: string,
    data: {
      address: string;
      chain: string;
    }
  ): Promise<Wallet> {
    return prisma.wallet.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  /**
   * Delete a wallet
   */
  static async deleteWallet(walletId: string): Promise<Wallet> {
    return prisma.wallet.delete({
      where: { id: walletId },
    });
  }

  /**
   * Update wallet chain
   */
  static async updateWalletChain(walletId: string, chain: string): Promise<Wallet> {
    return prisma.wallet.update({
      where: { id: walletId },
      data: { chain },
    });
  }

  /**
   * Get wallet with its trades
   */
  static async getWalletWithTrades(walletId: string): Promise<Wallet | null> {
    return prisma.wallet.findUnique({
      where: { id: walletId },
      include: {
        trades: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }
}

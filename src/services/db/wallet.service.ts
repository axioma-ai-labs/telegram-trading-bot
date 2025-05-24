import { prisma } from '@/services/db/prisma';
import { Wallet } from '@prisma/client/edge';

export class WalletService {
  /**
   * Create a new wallet
   */
  static async createWallet(data: {
    address: string;
    chain: string;
    userId: string;
    encryptedPrivateKey: string;
    type?: string;
  }): Promise<Wallet> {
    return prisma.wallet.create({
      data: {
        address: data.address,
        chain: data.chain,
        userId: data.userId,
        encryptedPrivateKey: data.encryptedPrivateKey,
        type: data.type,
      },
    });
  }

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
  static async getWalletsByUserId(userId: string): Promise<Wallet[]> {
    return prisma.wallet.findMany({
      where: { userId },
      include: {
        trades: true,
      },
    });
  }

  /**
   * Get wallets by chain for a user
   */
  static async getWalletsByChain(userId: string, chain: string): Promise<Wallet[]> {
    return prisma.wallet.findMany({
      where: {
        userId,
        chain,
      },
      include: {
        trades: true,
      },
    });
  }

  /**
   * Delete wallet
   */
  static async deleteWallet(address: string): Promise<Wallet> {
    return prisma.wallet.delete({
      where: { address },
    });
  }
}

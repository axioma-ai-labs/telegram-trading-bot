import { prisma } from './prisma';
import { Trade } from '../../generated/prisma';

export class TransactionsService {
  /**
   * Create a new trade transaction
   */
  static async createTrade(
    userId: string,
    walletId: string,
    data: {
      type: 'buy' | 'sell';
      tokenAddress: string;
      tokenSymbol: string;
      amount: number;
      price: number;
      totalValue: number;
      status: 'pending' | 'completed' | 'failed';
      txHash?: string;
    }
  ): Promise<Trade> {
    return prisma.trade.create({
      data: {
        ...data,
        userId,
        walletId,
      },
    });
  }

  /**
   * Get user's recent transactions
   */
  static async getRecentTransactions(userId: string, limit: number = 10): Promise<Trade[]> {
    return prisma.trade.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        wallet: true,
      },
    });
  }

  /**
   * Get transactions for a specific wallet
   */
  static async getWalletTransactions(walletId: string, limit: number = 10): Promise<Trade[]> {
    return prisma.trade.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(
    tradeId: string,
    status: 'pending' | 'completed' | 'failed',
    txHash?: string
  ): Promise<Trade> {
    return prisma.trade.update({
      where: { id: tradeId },
      data: {
        status,
        txHash,
      },
    });
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(tradeId: string): Promise<Trade | null> {
    return prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        wallet: true,
        user: true,
      },
    });
  }

  /**
   * Get transaction statistics for a user
   */
  static async getUserTransactionStats(userId: string): Promise<{
    totalTransactions: number;
    totalVolume: number;
    successfulTrades: number;
    failedTrades: number;
  }> {
    const trades = await prisma.trade.findMany({
      where: { userId },
    });

    return {
      totalTransactions: trades.length,
      totalVolume: trades.reduce((sum, trade) => sum + trade.amount, 0),
      successfulTrades: trades.filter((trade) => trade.status === 'completed').length,
      failedTrades: trades.filter((trade) => trade.status === 'failed').length,
    };
  }
}

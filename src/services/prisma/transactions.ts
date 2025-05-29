/**
 * @category Services
 */

import { prisma } from '@/services/prisma/client';
import { Transaction, TransactionType, TransactionStatus } from '@prisma/client/edge';

export interface CreateTransactionData {
  type: TransactionType;
  chain: string;
  status?: TransactionStatus;
  
  // Token details
  tokenInAddress?: string;
  tokenInSymbol?: string;
  tokenInAmount?: number;
  tokenOutAddress?: string;
  tokenOutSymbol?: string;
  tokenOutAmount?: number;
  
  // Transaction details
  txHash?: string;
  orderHash?: string;
  
  // DCA specific
  times?: number;
  expire?: string;
  
  // Withdrawal specific
  toAddress?: string;
  
  // Legacy fields for backward compatibility
  tokenAddress?: string;
  tokenSymbol?: string;
  amount?: number;
  price?: number;
  totalValue?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'transactionId';
  orderDirection?: 'asc' | 'desc';
}

export class TransactionsService {
  /**
   * Create a new transaction
   */
  static async createTransaction(
    userId: string,
    walletId: string,
    data: CreateTransactionData
  ): Promise<Transaction> {
    return prisma.transaction.create({
      data: {
        ...data,
        userId,
        walletId,
        status: data.status || TransactionStatus.PENDING,
      },
    });
  }

  /**
   * Create a buy transaction
   */
  static async createBuyTransaction(
    userId: string,
    walletId: string,
    data: {
      chain: string;
      tokenInAddress: string;
      tokenInSymbol: string;
      tokenInAmount: number;
      tokenOutAddress: string;
      tokenOutSymbol: string;
      tokenOutAmount?: number;
      txHash?: string;
      status?: TransactionStatus;
    }
  ): Promise<Transaction> {
    return this.createTransaction(userId, walletId, {
      type: TransactionType.BUY,
      ...data,
    });
  }

  /**
   * Create a sell transaction
   */
  static async createSellTransaction(
    userId: string,
    walletId: string,
    data: {
      chain: string;
      tokenInAddress: string;
      tokenInSymbol: string;
      tokenInAmount: number;
      tokenOutAddress: string;
      tokenOutSymbol: string;
      tokenOutAmount?: number;
      txHash?: string;
      status?: TransactionStatus;
    }
  ): Promise<Transaction> {
    return this.createTransaction(userId, walletId, {
      type: TransactionType.SELL,
      ...data,
    });
  }

  /**
   * Create a DCA transaction
   */
  static async createDcaTransaction(
    userId: string,
    walletId: string,
    data: {
      chain: string;
      tokenInAddress: string;
      tokenInSymbol: string;
      tokenInAmount: number;
      tokenOutAddress: string;
      tokenOutSymbol: string;
      times: number;
      expire: string;
      orderHash?: string;
      status?: TransactionStatus;
    }
  ): Promise<Transaction> {
    return this.createTransaction(userId, walletId, {
      type: TransactionType.DCA,
      ...data,
    });
  }

  /**
   * Create a limit order transaction
   */
  static async createLimitOrderTransaction(
    userId: string,
    walletId: string,
    data: {
      chain: string;
      tokenInAddress: string;
      tokenInSymbol: string;
      tokenInAmount: number;
      tokenOutAddress: string;
      tokenOutSymbol: string;
      tokenOutAmount: number;
      expire: string;
      orderHash?: string;
      status?: TransactionStatus;
    }
  ): Promise<Transaction> {
    return this.createTransaction(userId, walletId, {
      type: TransactionType.LIMIT_ORDER,
      ...data,
    });
  }

  /**
   * Create a withdraw transaction
   */
  static async createWithdrawTransaction(
    userId: string,
    walletId: string,
    data: {
      chain: string;
      tokenInAddress: string;
      tokenInSymbol: string;
      tokenInAmount: number;
      toAddress: string;
      txHash?: string;
      status?: TransactionStatus;
    }
  ): Promise<Transaction> {
    return this.createTransaction(userId, walletId, {
      type: TransactionType.WITHDRAW,
      ...data,
    });
  }

  /**
   * Get user's transactions with pagination
   */
  static async getUserTransactions(
    userId: string,
    options: PaginationOptions = {}
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { [orderBy]: orderDirection },
        skip,
        take: limit,
        include: {
          wallet: true,
        },
      }),
      prisma.transaction.count({
        where: { userId },
      }),
    ]);

    return {
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get wallet's transactions with pagination
   */
  static async getWalletTransactions(
    walletId: string,
    options: PaginationOptions = {}
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { walletId },
        orderBy: { [orderBy]: orderDirection },
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: { walletId },
      }),
    ]);

    return {
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get user's recent transactions
   */
  static async getRecentTransactions(userId: string, limit: number = 10): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        wallet: true,
      },
    });
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    txHash?: string
  ): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status,
        ...(txHash && { txHash }),
      },
    });
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(transactionId: string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        wallet: true,
        user: true,
      },
    });
  }

  /**
   * Get transaction by order hash (for limit orders and DCA)
   */
  static async getTransactionByOrderHash(orderHash: string): Promise<Transaction | null> {
    return prisma.transaction.findFirst({
      where: { orderHash },
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
    pendingTrades: number;
    byType: Record<TransactionType, number>;
  }> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    const byType = transactions.reduce((acc, transaction) => {
      acc[transaction.type] = (acc[transaction.type] || 0) + 1;
      return acc;
    }, {} as Record<TransactionType, number>);

    return {
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce((sum, transaction) => {
        return sum + (transaction.tokenInAmount || 0);
      }, 0),
      successfulTrades: transactions.filter((t) => t.status === TransactionStatus.COMPLETED).length,
      failedTrades: transactions.filter((t) => t.status === TransactionStatus.FAILED).length,
      pendingTrades: transactions.filter((t) => t.status === TransactionStatus.PENDING).length,
      byType,
    };
  }

  /**
   * Get transactions by type and status
   */
  static async getTransactionsByTypeAndStatus(
    userId: string,
    type?: TransactionType,
    status?: TransactionStatus,
    options: PaginationOptions = {}
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = options;

    const skip = (page - 1) * limit;
    const where: { userId: string; type?: TransactionType; status?: TransactionStatus } = {
      userId,
    };
    
    if (type) where.type = type;
    if (status) where.status = status;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { [orderBy]: orderDirection },
        skip,
        take: limit,
        include: {
          wallet: true,
        },
      }),
      prisma.transaction.count({
        where,
      }),
    ]);

    return {
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
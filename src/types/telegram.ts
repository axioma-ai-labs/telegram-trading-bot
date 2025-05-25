import { Context, SessionFlavor } from 'grammy';

/**
 * Session data interface
 */
export interface SessionData {
  userId?: number;
  username?: string;
  startTime: number;
  lastInteractionTime: number;
  currentOperation: OperationState | null;
  user?: {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
    updatedAt: Date;
    referralCode: string | null;
    referredById: string | null;
    termsAccepted: boolean;
    wallets: Array<{
      id: string;
      address: string;
      chain: string;
      type: string;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
    }>;
    settings: {
      id: string;
      userId: string;
      language: string;
      autoTrade: boolean;
      proMode: boolean;
      createdAt: Date;
      updatedAt: Date;
      gasPriority: string;
      slippage: string;
    } | null;
    referralStats: {
      id: string;
      userId: string;
      feeRate: number;
      totalReferrals: number;
      totalTrades: number;
      totalVolume: number;
      totalEarned: number;
      createdAt: Date;
      updatedAt: Date;
    } | null;
    cachedAt: number;
  };
}

/**
 * Custom context type with session
 */
export type BotContext = Context & SessionFlavor<SessionData>;

export type OperationType = 'buy' | 'sell' | 'dca' | 'limit' | null;

export interface OperationState {
  type: OperationType;
  token?: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenChain?: string;
  amount?: number;
  interval?: number;
  times?: number;
  price?: number;
  expiry?: string;
}

import { I18nFlavor } from '@grammyjs/i18n';
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
  currentMessage: CurrentMessage | null;
  userLanguage?: string;
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
 * Custom context type with session and i18n
 */
export type BotContext = Context & SessionFlavor<SessionData> & I18nFlavor;

export type OperationType =
  | 'buy'
  | 'sell'
  | 'dca'
  | 'limit'
  | 'pk_verification'
  | 'withdraw'
  | null;

export interface OperationState {
  type: OperationType;
  subType?: 'buy' | 'sell'; // For limit orders: buy vs sell
  token?: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenChain?: string;
  tokenPrice?: number; // Current market price of the token
  tokenBalance?: string; // User's balance of the token (for sell orders)
  amount?: number;
  fromAmount?: number; // Amount to spend/sell
  toAmount?: number; // Amount to receive/buy
  unitPrice?: number; // Price per token (for sell orders)
  interval?: number;
  times?: number;
  price?: number;
  expiry?: string;
  walletAddress?: string;
  recipientAddress?: string;
}

export type MessageType = 'verification' | 'temporary' | 'confirmation';

export interface CurrentMessage {
  messageId: number;
  chatId: number;
  type: MessageType;
}

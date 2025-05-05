import { Context, SessionFlavor } from 'grammy';

/**
 * Session data interface
 */
export interface SessionData {
  // Add your session data fields here
  userId?: number;
  username?: string;
  startTime: number;
  lastInteractionTime: number;
}

/**
 * Custom context type with session
 */
export type BotContext = Context & SessionFlavor<SessionData>;

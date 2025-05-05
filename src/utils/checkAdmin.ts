import { Context } from 'grammy';
import config from '../config/config';

/**
 * Checks if a Telegram message is from an admin user.
 * 
 * @param ctx - The Telegram context to check
 * @returns True if user is an admin, false otherwise
 */
export const isAdmin = (ctx: Context): boolean => {
  // For now, let's consider only the developer as admin
  // You can add more admin IDs in your .env file later
  const adminIds = [123456789]; // Replace with your actual admin ID
  
  // Check if user ID is in admin list
  return adminIds.includes(ctx.from?.id ?? 0);
};

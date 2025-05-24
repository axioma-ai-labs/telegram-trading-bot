import { BotContext } from '@/types/config';
import { UserService } from '@/services/db/user.service';
import { not_registered_message } from '@/bot/commands/dca';
import { acceptTermsConditionsKeyboard, acceptTermsConditionsMessage } from '@/bot/commands/start';
import { createWalletKeyboard, createWalletMessage } from '@/bot/commands/wallet';
import { ReferralStats, Settings, User, Wallet } from '@prisma/client/edge';

type UserWithRelations = User & {
  wallets: Wallet[];
  settings: Settings | null;
  referralStats: ReferralStats | null;
};

interface CachedUser extends UserWithRelations {
  cachedAt: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Checks if cached user data is still valid.
 *
 * @param cachedUser - The cached user data
 * @returns Whether the cache is still valid
 */
function isCacheValid(cachedUser: CachedUser | undefined): boolean {
  if (!cachedUser || !cachedUser.cachedAt) return false;
  return Date.now() - cachedUser.cachedAt < CACHE_TTL;
}

/**
 * Gets user data from cache or database.
 *
 * @param ctx - The bot context
 * @param telegramId - The Telegram user ID
 * @param forceRefresh - Whether to force refresh from database
 * @returns User data or null
 */
async function getUserData(
  ctx: BotContext,
  telegramId: string,
  forceRefresh = false
): Promise<UserWithRelations | null> {
  // Check session cache first
  if (!forceRefresh && ctx.session.user && isCacheValid(ctx.session.user)) {
    return ctx.session.user;
  }

  // Fetch from database
  const user = await UserService.getUserByTelegramId(telegramId);

  // Cache in session
  if (user) {
    ctx.session.user = {
      ...user,
      cachedAt: Date.now(),
    };
    return user;
  }

  // Clear invalid cache
  ctx.session.user = undefined;
  return null;
}

/**
 * Invalidates the user cache in session.
 *
 * @param ctx - The bot context
 */
export function invalidateUserCache(ctx: BotContext): void {
  ctx.session.user = undefined;
}

/**
 * Refreshes user data in cache.
 *
 * @param ctx - The bot context
 * @returns Updated user data or null
 */
export async function refreshUserCache(ctx: BotContext): Promise<UserWithRelations | null> {
  if (!ctx.from?.id) return null;

  const telegramId = ctx.from.id.toString();
  return getUserData(ctx, telegramId, true);
}

/**
 * Updates specific user data in cache without full refresh.
 *
 * @param ctx - The bot context
 * @param updates - Partial user data to update
 */
export function updateUserCache(ctx: BotContext, updates: Partial<UserWithRelations>): void {
  if (ctx.session.user) {
    ctx.session.user = {
      ...ctx.session.user,
      ...updates,
      cachedAt: Date.now(),
    };
  }
}

/**
 * Gets cached user data without database call.
 *
 * @param ctx - The bot context
 * @returns Cached user data or null if not cached or expired
 */
export function getCachedUser(ctx: BotContext): UserWithRelations | null {
  if (ctx.session.user && isCacheValid(ctx.session.user)) {
    return ctx.session.user;
  }
  return null;
}

/**
 * Validates if a user is registered and has a wallet.
 *
 * @param ctx - The bot context containing user information
 * @returns An object containing validation results and user data
 * @returns {Promise<{isValid: boolean; user: UserWithRelations | null}>} Validation result with user data if valid
 */
export async function validateUserAndWallet(ctx: BotContext): Promise<{
  isValid: boolean;
  user: UserWithRelations | null;
}> {
  // check telegram id
  if (!ctx.from?.id) {
    return { isValid: false, user: null };
  }

  const telegramId = ctx.from.id.toString();
  const user = await getUserData(ctx, telegramId);

  // check registered
  if (!user) {
    await ctx.reply(not_registered_message, {
      parse_mode: 'Markdown',
    });
    return { isValid: false, user: null };
  }

  // check terms accepted
  if (!user.termsAccepted) {
    await ctx.reply(acceptTermsConditionsMessage, {
      parse_mode: 'Markdown',
      reply_markup: acceptTermsConditionsKeyboard,
    });
    return { isValid: false, user: null };
  }

  // check has wallet
  if (!user.wallets?.length) {
    await ctx.reply(createWalletMessage, {
      parse_mode: 'Markdown',
      reply_markup: createWalletKeyboard,
    });
    return { isValid: false, user: null };
  }

  return { isValid: true, user };
}

/**
 * Lightweight validation that only checks cached data.
 * Use this for non-critical validations where you don't want to trigger DB calls.
 *
 * @param ctx - The bot context
 * @returns True if user is valid and cached, false otherwise
 */
export function isUserValidCached(ctx: BotContext): boolean {
  const cachedUser = getCachedUser(ctx);
  return !!(cachedUser && cachedUser.termsAccepted && cachedUser.wallets?.length > 0);
}

/**
 * Gets user from cache or validates fresh (for critical operations).
 *
 * @param ctx - The bot context
 * @param allowStale - Whether to allow stale cache data
 * @returns User data or null
 */
export async function getValidatedUser(
  ctx: BotContext,
  allowStale = false
): Promise<UserWithRelations | null> {
  // For critical operations, always get fresh data
  if (!allowStale) {
    const { isValid, user } = await validateUserAndWallet(ctx);
    return isValid ? user : null;
  }

  // For non-critical operations, use cache if available
  const cachedUser = getCachedUser(ctx);
  if (cachedUser && cachedUser.termsAccepted && cachedUser.wallets?.length > 0) {
    return cachedUser;
  }

  // Fallback to full validation
  const { isValid, user } = await validateUserAndWallet(ctx);
  return isValid ? user : null;
}

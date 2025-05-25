import { BotContext } from '@/types/telegram';
import { UserService } from '@/services/prisma/user';
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

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Check if cache is valid
function isCacheValid(cachedUser: CachedUser | undefined): boolean {
  return !!(cachedUser?.cachedAt && Date.now() - cachedUser.cachedAt < CACHE_TTL);
}

// Get user from cache or DB
async function getUserData(
  ctx: BotContext,
  telegramId: string,
  forceRefresh = false
): Promise<UserWithRelations | null> {
  if (!forceRefresh && ctx.session.user && isCacheValid(ctx.session.user)) {
    return ctx.session.user;
  }

  const user = await UserService.getUserByTelegramId(telegramId);

  if (user) {
    ctx.session.user = { ...user, cachedAt: Date.now() };
    return user;
  }

  ctx.session.user = undefined;
  return null;
}

// Cache utilities
export function invalidateUserCache(ctx: BotContext): void {
  ctx.session.user = undefined;
}

export function updateUserCache(ctx: BotContext, updates: Partial<UserWithRelations>): void {
  if (ctx.session.user) {
    ctx.session.user = { ...ctx.session.user, ...updates, cachedAt: Date.now() };
  }
}

export function getCachedUser(ctx: BotContext): UserWithRelations | null {
  return ctx.session.user && isCacheValid(ctx.session.user) ? ctx.session.user : null;
}

export function refreshUserCache(ctx: BotContext): Promise<UserWithRelations | null> {
  return ctx.from?.id ? getUserData(ctx, ctx.from.id.toString(), true) : Promise.resolve(null);
}

// Lightweight cache-only validation
export function isUserValidCached(ctx: BotContext): boolean {
  const cachedUser = getCachedUser(ctx);
  return !!(cachedUser && cachedUser.termsAccepted && cachedUser.wallets?.length > 0);
}

// Get user with cache preference
export async function getValidatedUser(
  ctx: BotContext,
  allowStale = false
): Promise<UserWithRelations | null> {
  if (!allowStale) {
    const { isValid, user } = await validateUserAndWallet(ctx);
    return isValid ? user : null;
  }

  const cachedUser = getCachedUser(ctx);
  if (cachedUser && cachedUser.termsAccepted && cachedUser.wallets?.length > 0) {
    return cachedUser;
  }

  const { isValid, user } = await validateUserAndWallet(ctx);
  return isValid ? user : null;
}

/**
 * Validates if a user is registered and has a wallet.
 *
 * @param ctx - The bot context containing user information
 * @param options - Optional validation options
 * @returns An object containing validation results and user data
 */
export async function validateUserAndWallet(
  ctx: BotContext,
  options: {
    allowStale?: boolean;
    cacheOnly?: boolean;
    skipMessages?: boolean;
    forceRefresh?: boolean;
  } = {}
): Promise<{
  isValid: boolean;
  user: UserWithRelations | null;
}> {
  const {
    allowStale = true,
    cacheOnly = false,
    skipMessages = false,
    forceRefresh = false,
  } = options;

  // check telegram id
  if (!ctx.from?.id) {
    return { isValid: false, user: null };
  }

  const telegramId = ctx.from.id.toString();

  // Cache-only mode - no DB calls, no messages
  if (cacheOnly) {
    const cachedUser = getCachedUser(ctx);
    const isValid = !!(cachedUser && cachedUser.termsAccepted && cachedUser.wallets?.length > 0);
    return { isValid, user: isValid ? cachedUser : null };
  }

  // Get user data with smart caching
  let user: UserWithRelations | null;

  if (allowStale) {
    // Try cache first for non-critical operations
    const cachedUser = getCachedUser(ctx);
    if (cachedUser && cachedUser.termsAccepted && cachedUser.wallets?.length > 0) {
      user = cachedUser;
    } else {
      user = await getUserData(ctx, telegramId, forceRefresh);
    }
  } else {
    // Standard behavior with caching
    user = await getUserData(ctx, telegramId, forceRefresh);
  }

  // check registered
  if (!user) {
    if (!skipMessages) {
      await ctx.reply(not_registered_message, {
        parse_mode: 'Markdown',
      });
    }
    return { isValid: false, user: null };
  }

  // check terms accepted
  if (!user.termsAccepted) {
    if (!skipMessages) {
      await ctx.reply(acceptTermsConditionsMessage, {
        parse_mode: 'Markdown',
        reply_markup: acceptTermsConditionsKeyboard,
      });
    }
    return { isValid: false, user: null };
  }

  // check has wallet
  if (!user.wallets?.length) {
    if (!skipMessages) {
      await ctx.reply(createWalletMessage, {
        parse_mode: 'Markdown',
        reply_markup: createWalletKeyboard,
      });
    }
    return { isValid: false, user: null };
  }

  return { isValid: true, user };
}

import { ReferralStats, Settings, User, Wallet } from '@prisma/client/edge';

import { bot } from '@/bot';
import { acceptTermsConditionsKeyboard } from '@/bot/commands/start';
import { createWalletKeyboard } from '@/bot/commands/wallet';
import logger from '@/config/logger';
import { ReferralService } from '@/services/prisma/referrals';
import { SettingsService } from '@/services/prisma/settings';
import { UserService } from '@/services/prisma/user';
import { BotContext } from '@/types/telegram';

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
  if (!forceRefresh && ctx.session.user && isCacheValid(ctx.session.user as CachedUser)) {
    return ctx.session.user as UserWithRelations;
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
      const message = ctx.t('no_registration_msg');
      await ctx.reply(message, {
        parse_mode: 'Markdown',
      });
    }
    return { isValid: false, user: null };
  }

  // check terms accepted
  if (!user.termsAccepted) {
    if (!skipMessages) {
      const message = ctx.t('accept_terms_conditions_msg');
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: acceptTermsConditionsKeyboard,
      });
    }
    return { isValid: false, user: null };
  }

  // check has wallet
  if (!user.wallets?.length) {
    if (!skipMessages) {
      const message = ctx.t('wallet_create_msg');
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: createWalletKeyboard,
      });
    }
    return { isValid: false, user: null };
  }

  return { isValid: true, user };
}

/**
 * Creates a new user with optional referral linking and default settings.
 *
 * @param ctx - The bot context containing user information
 * @param telegramId - The user's Telegram ID
 * @param referralLink - The user's referral link
 * @param referrer - Optional referrer user for linking referrals
 * @returns The created user
 */
export async function createNewUser(
  ctx: BotContext,
  telegramId: string,
  referralLink: string,
  referrer?: User
): Promise<UserWithRelations> {
  // Create new user
  const user = await UserService.upsertUser(telegramId, {
    username: ctx.from?.username,
    firstName: ctx.from?.first_name,
    lastName: ctx.from?.last_name,
    referralCode: referralLink,
  });

  // Link referral if referrer exists
  if (referrer) {
    await ReferralService.linkReferral(user.id, referrer.id);
    logger.info('Referrer:', referrer.id, 'has successfully referred:', user.id);
    await sendReferralNotification(ctx, referrer.telegramId);
  }

  // Create default settings
  await SettingsService.upsertSettings(user.id, {
    language: 'en',
    autoTrade: false,
    proMode: false,
    gasPriority: 'standard',
    slippage: '0.5',
  });

  // Update cache with full user data
  const userWithRelations = await UserService.getUserByTelegramId(telegramId);
  if (userWithRelations) {
    ctx.session.user = { ...userWithRelations, cachedAt: Date.now() };
    logger.info('New user created:', telegramId);
    return userWithRelations;
  }

  logger.info('New user created:', telegramId);
  return user as UserWithRelations;
}

export async function sendReferralNotification(ctx: BotContext, telegramId: string): Promise<void> {
  const message = ctx.t('referral_success_notification_msg');

  await bot.api.sendMessage(telegramId, message, {
    parse_mode: 'Markdown',
    link_preview_options: {
      is_disabled: true,
    },
  });

  logger.info(`Referral notification sent to user: ${telegramId}`);
}

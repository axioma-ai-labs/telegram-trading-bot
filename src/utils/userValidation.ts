/**
 * @category Utils
 */
import { ReferralStats, Settings, User, Wallet } from '@prisma/client/edge';

import { bot } from '@/bot';
import { acceptTermsConditionsKeyboard } from '@/bot/commands/start';
import { createWalletKeyboard } from '@/bot/commands/wallet';
import logger from '@/config/logger';
import { CacheManager } from '@/services/cache/cacheManager';
import { ReferralService } from '@/services/prisma/referrals';
import { SettingsService } from '@/services/prisma/settings';
import { UserService } from '@/services/prisma/user';
import { BotContext } from '@/types/telegram';

type UserWithRelations = User & {
  wallets: Wallet[];
  settings: Settings | null;
  referralStats: ReferralStats | null;
};

// global cache instance for user data
const userCache = new CacheManager(500, 5 * 60 * 1000); // 500 users, 5min TTL

/**
 * Validates user and returns user data with caching support
 *
 * @param ctx - The bot context containing user information
 * @param options - Validation options
 * @returns Validation result with user data
 */
export async function validateUser(
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
  const cacheKey = `user_${telegramId}`;

  // cache-only mode - no DB calls, no messages
  if (cacheOnly) {
    const cachedUser = userCache.get<UserWithRelations>(cacheKey);
    const isValid = !!(cachedUser && cachedUser.termsAccepted && cachedUser.wallets?.length > 0);
    return { isValid, user: isValid ? cachedUser : null };
  }

  // get user data with smart caching
  let user: UserWithRelations | null = null;

  if (allowStale && !forceRefresh) {
    // try cache first for non-critical operations
    const cachedUser = userCache.get<UserWithRelations>(cacheKey);
    if (cachedUser && cachedUser.termsAccepted && cachedUser.wallets?.length > 0) {
      user = cachedUser;
    }
  }

  // fetch from database if not in cache or force refresh
  if (!user || forceRefresh) {
    user = await UserService.getUserByTelegramId(telegramId);

    // cache the result
    if (user) {
      userCache.set(cacheKey, user as UserWithRelations);
    }
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
 * Creates a new user with optional referral linking and default settings
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
  // create new user
  const user = await UserService.upsertUser(telegramId, {
    username: ctx.from?.username,
    firstName: ctx.from?.first_name,
    lastName: ctx.from?.last_name,
    referralCode: referralLink,
  });

  // link referral if referrer exists
  if (referrer) {
    await ReferralService.linkReferral(user.id, referrer.id);
    logger.info('Referrer:', referrer.id, 'has successfully referred:', user.id);

    // send referral notification to referrer
    const message = ctx.t('referral_success_notification_msg');
    await bot.api.sendMessage(referrer.telegramId, message, {
      parse_mode: 'Markdown',
      link_preview_options: {
        is_disabled: true,
      },
    });
  }

  // create default settings
  await SettingsService.upsertSettings(user.id, {
    language: 'en',
    autoTrade: false,
    proMode: false,
    gasPriority: 'standard',
    slippage: '0.5',
  });

  // update cache with full user data
  const userWithRelations = await UserService.getUserByTelegramId(telegramId);
  if (userWithRelations) {
    userCache.set(`user_${telegramId}`, userWithRelations as UserWithRelations);
    logger.info('New user created:', telegramId);
    return userWithRelations;
  }

  logger.info('New user created:', telegramId);
  return user as UserWithRelations;
}

// cache utilities
export function invalidateUserCache(telegramId: string): void {
  userCache.delete(`user_${telegramId}`);
}

export function updateUserCache(telegramId: string, updates: Partial<UserWithRelations>): void {
  const cacheKey = `user_${telegramId}`;
  const cachedUser = userCache.get<UserWithRelations>(cacheKey);

  if (cachedUser) {
    userCache.set(cacheKey, { ...cachedUser, ...updates } as UserWithRelations);
  }
}

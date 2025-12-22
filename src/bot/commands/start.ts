/**
 * @category Bot
 */
import { InlineKeyboard } from 'grammy';

import { config } from '@/config/config';
import logger from '@/config/logger';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { ReferralService } from '@/services/prisma/referrals';
import { UserService } from '@/services/prisma/user';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { createNewUser, validateUser } from '@/utils/userValidation';

/**
 * Main navigation keyboard displayed to users after starting the bot.
 * Provides access to all core trading and wallet management functions.
 */
export const startKeyboard = new InlineKeyboard()
  .text('Buy', 'buy')
  .text('Sell', 'sell')
  .row()
  .text('DCA', 'dca')
  .text('Limit orders', 'limit')
  .row()
  .text('Wallet', 'create_wallet')
  .text('Withdraw', 'withdraw')
  .text('Deposit', 'deposit')
  .text('Orders', 'orders')
  .row()
  .text('📈 Transactions', 'view_transactions')
  .text('💵 Referrals', 'get_referral_link')
  .row()
  .text('⚙️ Settings', 'open_settings')
  .text('💬 Help', 'get_help');

/**
 * Keyboard shown to new users to begin their trading journey.
 */
export const startTradingKeyboard = new InlineKeyboard().text('Start Trading 🚀', 'start_trading');

/**
 * Keyboard for accepting terms and conditions for new users.
 */
export const acceptTermsConditionsKeyboard = new InlineKeyboard().text(
  '✅ Accept',
  'accept_terms_conditions'
);

/**
 * Start command handler - entry point for all bot interactions.
 *
 * Handles both new and existing users with the following flow:
 * 1. Extracts referral information from command payload
 * 2. Checks if user exists in database
 * 3. For new users: creates account, handles referrals, shows terms
 * 4. For existing users: validates account and shows main menu
 *
 * Supports referral system where new users can be referred by existing users
 * using referral links with format: /start r-{referralCode}
 *
 * @example
 * User interactions:
 * - New user: /start → Terms & Conditions
 * - New user with referral: /start r-username → Terms & Conditions + referral credit
 * - Existing user: /start → Main trading menu
 * - Existing user without wallet: /start → Wallet creation flow
 */
export const startCommandHandler: CommandHandler = {
  command: 'start',
  description: 'Start the bot',
  handler: async (ctx: BotContext): Promise<void> => {
    if (!ctx.from?.id) {
      return;
    }

    const neurodex = new NeuroDexApi();
    const telegramId = ctx.from.id.toString();
    const payload = ctx.match?.toString() || ''; // Payload from referral link
    const referralLink = await neurodex.generateReferralLink(ctx.from.id, ctx.from.username || '');

    // Check if user exists
    const existingUser = await UserService.getUserByTelegramId(telegramId);

    // Handle new users (with or without referral)
    if (!existingUser) {
      let referrer = null;

      // Handle referral if payload exists
      if (payload && payload.startsWith('r-')) {
        const referralCode = `https://t.me/${config.telegram.botUsername}?start=${payload.trim()}`;
        referrer = await ReferralService.getUserByReferralCode(referralCode);
      }

      // Create new user
      await createNewUser(ctx, telegramId, referralLink, referrer || undefined);

      const message = ctx.t('accept_terms_conditions_msg');
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: acceptTermsConditionsKeyboard,
        link_preview_options: {
          is_disabled: true,
        },
      });
      return;
    }

    // validate user (existing user)
    await validateUser(ctx, { allowStale: true });
    logger.info('Existing user:', telegramId);

    // show main menu
    const message = ctx.t('start_msg');
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: startKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  },
};

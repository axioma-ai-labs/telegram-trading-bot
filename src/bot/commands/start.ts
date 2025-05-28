import { InlineKeyboard } from 'grammy';

import logger from '@/config/logger';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { ReferralService } from '@/services/prisma/referrals';
import { UserService } from '@/services/prisma/user';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { createNewUser, validateUser } from '@/utils/userValidation';

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
  .text('💵 Referrals', 'get_referral_link')
  .row()
  .text('⚙️ Settings', 'open_settings')
  .text('💬 Help', 'get_help');

export const startTradingKeyboard = new InlineKeyboard().text('Start Trading 🚀', 'start_trading');

export const acceptTermsConditionsKeyboard = new InlineKeyboard().text(
  '✅ Accept',
  'accept_terms_conditions'
);

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
        const referralCode = 'https://t.me/neuro_bro_test_bot?start=' + payload.trim();
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
    const { isValid } = await validateUser(ctx, { allowStale: true });

    if (isValid) {
      // Existing user with wallet & accepted terms conditions
      logger.info('Existing user:', telegramId);
      const message = ctx.t('start_msg');
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: startKeyboard,
        link_preview_options: {
          is_disabled: true,
        },
      });
    } else {
      // validate user (existing user)
      await validateUser(ctx);
    }
  },
};

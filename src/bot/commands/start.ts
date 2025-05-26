import { InlineKeyboard } from 'grammy';

import { createWalletKeyboard, createWalletMessage } from '@/bot/commands/wallet';
import logger from '@/config/logger';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { ReferralService } from '@/services/prisma/referrals';
import { SettingsService } from '@/services/prisma/settings';
import { UserService } from '@/services/prisma/user';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';

export const startMessage = `*💸 Neurodex*

Neurodex is your lightning fast crypto trading bot

Buy and sell crypto with ease using Neurodex.

/buy - Buy any crypto token on Base, BSC & Ethereum
/sell - Sell any crypto token on Base, BSC & Ethereum
/dca - Dollar Cost Averaging (DCA)
/limit - Create limit orders
/wallet - Manage your wallet
/settings - Configure your bot settings
/help - Get help and support

Powered by [Neurobro](https://neurobro.ai) and [Docs](https://docs.neurodex.xyz)`;

export const startKeyboard = new InlineKeyboard()
  .text('Buy', 'buy')
  .text('Sell', 'sell')
  .row()
  .text('DCA', 'dca')
  .row()
  .text('Wallet', 'create_wallet')
  .text('Withdraw', 'withdraw')
  .text('Deposit', 'deposit')
  .row()
  .text('💵 Referrals', 'get_referral_link')
  .row()
  .text('⚙️ Settings', 'open_settings')
  .text('💬 Help', 'get_help');

////////////////////////////////////////////////////////////
// New User
////////////////////////////////////////////////////////////

export const acceptTermsConditionsMessage = `*💸 Welcome to Neurodex*

Before we get started, please review and accept our terms of service & privacy policy.

• [Terms of Service](https://docs.neurodex.xyz/terms-of-service)
• [Privacy Policy](https://docs.neurodex.xyz/privacy-policy)`;

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

    const user = await UserService.getUserByTelegramId(telegramId);
    const USER_HAS_WALLET = user?.wallets && user.wallets.length > 0;
    const IS_ACCEPTED_TERMS_CONDITIONS = user?.termsAccepted ?? false;
    const IS_REGISTERED = user !== null;
    const referralLink = await neurodex.generateReferralLink(ctx.from.id, ctx.from.username || '');

    // Referred user
    if (payload && payload.startsWith('r-')) {
      // TODO: optimize this logic for parsing the referral code
      const referralCode = 'https://t.me/neuro_bro_test_bot?start=' + payload.trim();
      const referrer = await ReferralService.getUserByReferralCode(referralCode);

      if (!IS_REGISTERED && referrer) {
        // Create new user with referral
        const user = await UserService.upsertUser(telegramId, {
          username: ctx.from.username,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name,
          referralCode: referralLink,
        });

        // Link the referral
        await ReferralService.linkReferral(user.id, referrer.id);
        logger.info('Referrer:', referrer.id, 'has successfully referred:', user.id);

        await SettingsService.upsertSettings(user.id, {
          language: 'en',
          autoTrade: false,
          proMode: false,
          gasPriority: 'standard',
          slippage: '0.5',
        });
        logger.info('New user created with referral:', telegramId);
        await ctx.reply(acceptTermsConditionsMessage, {
          parse_mode: 'Markdown',
          reply_markup: acceptTermsConditionsKeyboard,
        });
        return;
      }
    }

    // New user (no referral)
    if (!IS_REGISTERED) {
      // New user without wallet
      const user = await UserService.upsertUser(telegramId, {
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        referralCode: referralLink,
      });
      await SettingsService.upsertSettings(user.id, {
        language: 'en',
        autoTrade: false,
        proMode: false,
        gasPriority: 'standard',
        slippage: '0.5',
      });
      logger.info('New user created:', telegramId);
      await ctx.reply(acceptTermsConditionsMessage, {
        parse_mode: 'Markdown',
        reply_markup: acceptTermsConditionsKeyboard,
      });
    } else if (!IS_ACCEPTED_TERMS_CONDITIONS) {
      logger.info('User not accepted terms conditions:', telegramId);
      await ctx.reply(acceptTermsConditionsMessage, {
        parse_mode: 'Markdown',
        reply_markup: acceptTermsConditionsKeyboard,
      });
    } else if (!USER_HAS_WALLET) {
      logger.info('User does not have a wallet:', telegramId);
      await ctx.reply(createWalletMessage, {
        parse_mode: 'Markdown',
        reply_markup: createWalletKeyboard,
      });
    } else {
      // Existing user with wallet & accepted terms conditions
      logger.info('Existing user:', telegramId);
      await ctx.reply(startMessage, {
        parse_mode: 'Markdown',
        reply_markup: startKeyboard,
        link_preview_options: {
          is_disabled: true,
        },
      });
    }
  },
};

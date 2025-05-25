import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { InlineKeyboard } from 'grammy';
import { ReferralService } from '@/services/prisma/referrals';
import { validateUserAndWallet } from '@/utils/userValidation';
import logger from '@/config/logger';

export const referralMessage = (referralLink: string): string => {
  return [
    '💎 *Referral Program*',
    '',
    'Share your referral link and earn rewards!',
    '',
    '*How it works:*',
    '1. Share your referral link below with your friends & family',
    '2. When they sign up using your link, you earn 10% of their trading fees',
    '3. You can earn unlimited rewards!',
    '',
    '🔗 *Your Referral Link:*',
    `\`${referralLink}\``,
    '',
    'Learn more about rewards and tiers in our official [docs](https://docs.neurodex.xyz/referral-program)',
  ].join('\n');
};

export const referralStatsMessage = (
  totalReferrals: number,
  totalEarned: number,
  totalTrades: number,
  totalVolume: number
): string => {
  return [
    '📊 *Referral Stats*',
    '',
    `Referred Users: ${totalReferrals} users`,
    `Referred Trades: ${totalTrades} trades`,
    `Referred Volume: $${totalVolume.toFixed(4)}`,
    `Total Referral Earnings: $${totalEarned.toFixed(4)}`,
    '',
    'Keep spreading the word and watch your earnings grow! 🚀',
  ].join('\n');
};

export const referralKeyboard = new InlineKeyboard()
  .text('📊 Referral Stats', 'get_referral_stats')
  .row()
  .text('← Back', 'back_start');

export const referralStatsKeyboard = new InlineKeyboard().text('← Back', 'back_referrals');

export const referralCommandHandler: CommandHandler = {
  command: 'referrals',
  description: 'Get your referral link',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid, user } = await validateUserAndWallet(ctx);
    if (!isValid || !user) return;

    const referralLink = user.referralCode || '';

    // init referral stats
    await ReferralService.initializeReferralStats(user.id);

    // update if no code
    if (!user.referralCode) {
      await ReferralService.upsertReferralCode(user.id, referralLink);
    }

    logger.info('Referral message:', referralMessage(referralLink));

    await ctx.reply(referralMessage(referralLink), {
      parse_mode: 'Markdown',
      reply_markup: referralKeyboard,
    });
  },
};

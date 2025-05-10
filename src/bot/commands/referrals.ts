import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { InlineKeyboard } from 'grammy';
import { ReferralService } from '@/services/db/referrals';
import { UserService } from '@/services/db/user.service';

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
    const userId = ctx.from?.id;
    const username = ctx.from?.username || `id${userId}`;
    if (!userId) return;

    // Get user
    const user = await UserService.getUserByTelegramId(userId.toString());
    if (!user) return;

    const neurodex = new NeuroDexApi();
    const referralLink = await neurodex.generateReferralLink(userId, username);

    // Initialize referral stats
    await ReferralService.initializeReferralStats(user.id);

    // Update user's referral code if they don't have one
    if (!user.referralCode) {
      await ReferralService.upsertReferralCode(user.id, referralLink);
    }

    await ctx.reply(referralMessage(referralLink), {
      parse_mode: 'Markdown',
      reply_markup: referralKeyboard,
    });
  },
};

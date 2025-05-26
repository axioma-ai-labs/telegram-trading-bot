import { referralKeyboard, referralStatsKeyboard } from '@/bot/commands/referrals';
import logger from '@/config/logger';
import { ReferralService } from '@/services/prisma/referrals';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

export async function getReferralLink(ctx: BotContext): Promise<void> {
  //validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid || !user) return;

  const referral_link = user.referralCode || '';
  await ReferralService.initializeReferralStats(user.id);
  logger.info('Referral link:', referral_link);

  await ctx.editMessageText(ctx.t('referral_msg', { referral_link }), {
    parse_mode: 'Markdown',
    reply_markup: referralKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

export async function getReferralStats(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid || !user) return;

  const referralStatistics = await ReferralService.getReferralStats(user.id);
  if (!referralStatistics) return;

  const message = ctx.t('referral_stats_msg', {
    totalReferrals: referralStatistics.totalReferrals,
    totalEarned: referralStatistics.totalEarned,
    totalTrades: referralStatistics.totalTrades,
    totalVolume: referralStatistics.totalVolume,
  });

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: referralStatsKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

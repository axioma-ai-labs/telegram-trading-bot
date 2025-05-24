import { BotContext } from '../../types/config';
import {
  referralMessage,
  referralKeyboard,
  referralStatsMessage,
  referralStatsKeyboard,
} from '../commands/referrals';
import { ReferralService } from '../../services/db/referrals';
import { validateUserAndWallet } from '@/utils/userValidation';

export async function getReferralLink(ctx: BotContext): Promise<void> {
  //validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid || !user) return;

  const referralLink = user.referralCode || '';
  await ReferralService.initializeReferralStats(user.id);

  await ctx.editMessageText(referralMessage(referralLink), {
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

  await ctx.editMessageText(
    referralStatsMessage(
      referralStatistics.totalReferrals,
      referralStatistics.totalEarned,
      referralStatistics.totalTrades,
      referralStatistics.totalVolume
    ),
    {
      parse_mode: 'Markdown',
      reply_markup: referralStatsKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    }
  );
}

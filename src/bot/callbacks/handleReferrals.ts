import { BotContext } from '../../types/config';
import { NeuroDexApi } from '../../services/engine/neurodex';
import {
  referralMessage,
  referralKeyboard,
  referralStatsMessage,
  referralStatsKeyboard,
} from '../commands/referrals';
import { ReferralService } from '../../services/prisma/referrals.service';
import { UserService } from '../../services/prisma/user.service';

export async function getReferralLink(ctx: BotContext): Promise<void> {
  const userId = ctx.from?.id;
  const username = ctx.from?.username || `id${userId}`;
  if (!userId) return;

  const neurodex = new NeuroDexApi();
  const referralLink = await neurodex.generateReferralLink(userId, username);

  const user = await UserService.getUserByTelegramId(userId.toString());
  if (!user) return;

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
  const userId = ctx.from?.id;
  if (!userId) return;

  const user = await UserService.getUserByTelegramId(userId.toString());
  if (!user) return;

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

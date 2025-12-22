import { InlineKeyboard } from 'grammy';

import { ReferralService } from '@/services/prisma/referrals';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUser } from '@/utils/userValidation';

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
    const user = await validateUser(ctx);

    const referralLink = user.referralCode || '';

    // init referral stats
    await ReferralService.initializeReferralStats(user.id);

    // update if no code
    if (!user.referralCode) {
      await ReferralService.upsertReferralCode(user.id, referralLink);
    }

    await ctx.reply(ctx.t('referral_msg', { referral_link: referralLink }), {
      parse_mode: 'Markdown',
      reply_markup: referralKeyboard,
    });
  },
};

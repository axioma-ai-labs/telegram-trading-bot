import { InlineKeyboard } from 'grammy';

import logger from '@/config/logger';
import { CoinStatsService } from '@/services/engine/coinstats';
import { ViemService } from '@/services/engine/viem';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUser } from '@/utils/userValidation';

export const sellTokenKeyboard = new InlineKeyboard()
  .text('25%', 'sell_amount_25')
  .text('50%', 'sell_amount_50')
  .text('75%', 'sell_amount_75')
  .row()
  .text('100%', 'sell_amount_100')
  .row()
  .text('Custom', 'sell_amount_custom');

export const confirmSellKeyboard = new InlineKeyboard()
  .text('✅ Confirm', 'sell_confirm')
  .text('❌ Cancel', 'sell_cancel');

export const sellCommandHandler: CommandHandler = {
  command: 'sell',
  description: 'Sell a token',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid, user } = await validateUser(ctx);
    if (!isValid || !user?.wallets?.[0]) return;

    ctx.session.currentOperation = { type: 'sell' };

    // Get wallet data
    const walletAddress = user.wallets[0].address as `0x${string}`;

    // Get ETH balance
    const viemService = new ViemService();
    const ethBalance = (await viemService.getNativeBalance(walletAddress)) || '0.000';

    // Get formatted sell balances
    const coinStatsService = CoinStatsService.getInstance();
    const formattedSellBalances = await coinStatsService.getFormattedSellBalances(
      walletAddress,
      'base'
    );

    logger.info('Sell token message with balances for user:', user.telegramId);

    await ctx.reply(
      ctx.t('sell_token_msg', {
        ethBalance,
        formattedSellBalances,
      }),
      {
        parse_mode: 'Markdown',
      }
    );
  },
};

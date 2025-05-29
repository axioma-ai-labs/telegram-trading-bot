import { depositKeyboard } from '@/bot/commands/deposit';
import { CoinStatsService } from '@/services/engine/coinstats';
import { ViemService } from '@/services/engine/viem';
import { BotContext } from '@/types/telegram';
import { validateUser } from '@/utils/userValidation';

export async function depositFunds(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUser(ctx);
  if (!isValid || !user) return;

  const viemService = new ViemService();
  const coinStatsService = CoinStatsService.getInstance();
  const walletAddress = user.wallets[0].address as `0x${string}`;

  // Get native ETH balance and CoinStats portfolio data in parallel
  const [balance, walletHoldings] = await Promise.all([
    viemService.getNativeBalance(walletAddress),
    coinStatsService.getWalletTokenHoldings(walletAddress, 'base', 0.1),
  ]);

  const ethBalance = balance || '0.000';

  const message = ctx.t('deposit_msg', {
    walletAddress: user.wallets[0].address,
    totalPortfolioValue: walletHoldings.totalPortfolioValue.toFixed(2),
    ethBalance,
    formattedBalances: walletHoldings.formattedBalances,
  });

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: depositKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

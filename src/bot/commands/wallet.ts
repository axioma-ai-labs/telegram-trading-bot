import { InlineKeyboard } from 'grammy';

import { CoinStatsService } from '@/services/engine/coinstats';
import { ViemService } from '@/services/engine/viem';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUser } from '@/utils/userValidation';

export const walletKeyboard = new InlineKeyboard()
  .text('Buy', 'buy')
  .text('Sell', 'sell')
  .row()
  .text('📈 Transactions', 'view_transactions')
  .row()
  .text('← Back', 'back_start')
  .text('↺ Refresh', 'refresh_wallet');

export const createWalletMessage = `
*💸 Neurodex*

Neurodex is your lightning fast crypto trading bot

To be able to /buy, /sell or do any other actions, you have to create a wallet first. Create one now by clicking the button below.

For any help setting up please refer to [this guide](https://docs.neurodex.xyz/getting-started/setup) or get /help.
`;

export const createWalletKeyboard = new InlineKeyboard().text('💵 Create Wallet', 'create_wallet');

export const walletCommandHandler: CommandHandler = {
  command: 'wallet',
  description: 'Manage your wallet',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid, user } = await validateUser(ctx);
    if (!isValid || !user?.wallets?.[0]) return;

    const viemService = new ViemService();
    const coinStatsService = CoinStatsService.getInstance();

    // check if user already has a wallet
    if (user.wallets && user.wallets.length > 0) {
      const walletAddress = user.wallets[0].address as `0x${string}`;

      // Get ETH and token holdings
      const [balance, walletHoldings] = await Promise.all([
        viemService.getNativeBalance(walletAddress),
        coinStatsService.getWalletTokenHoldings(walletAddress, 'base', 0.1),
      ]);

      const ethBalance = balance || '0.000';

      const message = ctx.t('wallet_msg', {
        walletAddress: user.wallets[0].address,
        totalPortfolioValue: walletHoldings.totalPortfolioValue.toFixed(2),
        ethBalance,
        formattedBalances: walletHoldings.formattedBalances,
      });

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: walletKeyboard,
        link_preview_options: {
          is_disabled: true,
        },
      });
      return;
    }
  },
};

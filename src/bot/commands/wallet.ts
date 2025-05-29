/**
 * @category Bot
 */
import { InlineKeyboard } from 'grammy';

import { CoinStatsService } from '@/services/engine/coinstats';
import { ViemService } from '@/services/engine/viem';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUser } from '@/utils/userValidation';

/**
 * Wallet management keyboard providing access to trading functions and wallet operations.
 * Includes quick access to buy/sell functions and wallet refresh capabilities.
 */
export const walletKeyboard = new InlineKeyboard()
  .text('Buy', 'buy')
  .text('Sell', 'sell')
  .row()
  .text('📈 Transactions', 'view_transactions')
  .row()
  .text('← Back', 'back_start')
  .text('↺ Refresh', 'refresh_wallet');

/**
 * Message displayed to users who haven't created a wallet yet.
 * Explains the need for wallet creation and provides setup guidance.
 */
export const createWalletMessage = `
*💸 Neurodex*

Neurodex is your lightning fast crypto trading bot

To be able to /buy, /sell or do any other actions, you have to create a wallet first. Create one now by clicking the button below.

For any help setting up please refer to [this guide](https://docs.neurodex.xyz/getting-started/setup) or get /help.
`;

/**
 * Keyboard for initiating wallet creation process.
 */
export const createWalletKeyboard = new InlineKeyboard().text('💵 Create Wallet', 'create_wallet');

/**
 * Wallet command handler for displaying wallet information and management options.
 *
 * Shows the user's wallet address, native token balance, and provides access to
 * wallet-related functions like trading, transactions, and balance refresh.
 *
 * Validates user authentication and wallet existence before displaying information.
 * Retrieves real-time balance from the blockchain using Viem service.
 *
 * @example
 * User types: /wallet
 * Bot displays:
 * - Wallet address (truncated for privacy)
 * - Current ETH/native token balance
 * - Action buttons for Buy, Sell, Transactions
 * - Refresh and Back navigation options
 *
 * @throws Will redirect to wallet creation if user has no wallet
 * @throws Will redirect to user validation if user is not authenticated
 */
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

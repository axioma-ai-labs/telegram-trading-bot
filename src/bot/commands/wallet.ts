import { InlineKeyboard } from 'grammy';
import { CommandHandler } from '../../types/commands';
import { BotContext } from '../../types/config';
import { hasWallet } from '../../utils/checkUser';
import { newUserStartMessage, newUserStartKeyboard } from './start';
import { WalletService } from '../../services/db/wallet.service';
import { UserService } from '../../services/db/user.service';
import { NeuroDexApi } from '../../services/engine/neurodex';

export const walletCreationOKMessage = `
✅ *Your wallet has been created successfully*

*Wallet Address:*
\`{walletAddress}\`

*Private Key:*
\`{privateKey}\`

*Balance:*
- ETH: {ethBalance}

⚠️ *IMPORTANT:* Keep your private key safe and secure
• Do not share it with anyone
• Do not store it digitally or online
• Write it down and store it safely

⏰ This message will be deleted in 5 minutes for security`;

export const walletCreationFailMessage = `❌ *Wallet Creation Failed*

Something went wrong. Please try again or go to /help.`;

export const walletMessage = `*💰 Wallet:* \`{walletAddress}\`

*Balance:*

ETH: {ethBalance}

To deposit funds, please send your coins to the wallet address above.`;

export const walletKeyboard = new InlineKeyboard()
  .text('Buy', 'buy')
  .text('Sell', 'sell')
  .row()
  .text('📈 Transactions', 'view_transactions')
  .row()
  .text('← Back', 'back_start')
  .text('↺ Refresh', 'refresh_wallet');

export const createWalletKeyboard = new InlineKeyboard()
  .text('Create', 'create_wallet')
  .row()
  .text('⬅ Back', 'back_start');

export const walletCommandHandler: CommandHandler = {
  command: 'wallet',
  description: 'Manage your wallet',
  handler: async (ctx: BotContext): Promise<void> => {
    if (!ctx.from?.id) {
      return;
    }

    const telegramId = ctx.from.id.toString();
    const USER_HAS_WALLET = await hasWallet(telegramId);
    console.log('User has wallet:', USER_HAS_WALLET);

    // If user has wallet, show wallet message
    if (USER_HAS_WALLET) {
      const user = await UserService.getUserByTelegramId(telegramId);
      if (!user) {
        return;
      }
      const wallets = await WalletService.getWalletsByUserId(user.id);
      console.log('Wallets:', wallets);

      // fetch data
      const api = new NeuroDexApi();
      const ethBalance = await api.getEthBalance(wallets[0].address);
      const existingWalletMessage = walletMessage
        .replace('{ethBalance}', ethBalance.data || '0')
        .replace('{walletAddress}', wallets[0].address);

      await ctx.reply(existingWalletMessage, {
        parse_mode: 'Markdown',
        reply_markup: walletKeyboard,
      });
    } else {
      // If user doesn't have wallet, show create wallet message
      await ctx.reply(newUserStartMessage, {
        parse_mode: 'Markdown',
        reply_markup: newUserStartKeyboard,
      });
    }
  },
};

import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { InlineKeyboard } from 'grammy';
import { hasWallet } from '@/utils/checkUser';
import { newUserStartMessage, newUserStartKeyboard } from './start';
import { WalletService } from '@/services/db/wallet.service';
import { UserService } from '@/services/db/user.service';

export const walletCreationOKMessage = `
✅ *Wallet Created Successfully*

*Your Wallet Address:*
\`{walletAddress}\`

*Your Private Key:*
\`{privateKey}\`

⚠️ *IMPORTANT:* Keep your private key safe and secure
• Do not share it with anyone
• Do not store it digitally or online
• Write it down and store it safely

⏰ This message will be deleted in 5 minutes for security`;

export const depositKeyboard = new InlineKeyboard().text('Deposit', 'deposit_funds');

export const walletCreationFailMessage = `❌ *Wallet Creation Failed*

Something went wrong. Please try again or go to /help.`;

export const walletMessage = '💰 Wallet message';

// export const walletMessage = `*💰 Wallet:* \`{walletAddress}\`

// *Balance:*

// {coin1}: {coin1Balance} | $${coin1UsdValue}
// {coin2}: {coin2Balance} | $${coin2UsdValue}
// {coin3}: {coin3Balance} | $${coin3UsdValue}

// *Total Net Worth:*
// - $${randomTotalNetWorth}

// To deposit funds, please send your coins to the wallet address above.`;

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

      const wallet_message = walletMessage.replace('{walletAddress}', wallets[0].address);

      await ctx.reply(wallet_message, {
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

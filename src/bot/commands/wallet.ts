import { InlineKeyboard } from 'grammy';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { UserService } from '@/services/db/user.service';
import { NeuroDexApi } from '@/services/engine/neurodex';

export const walletCreationOKMessage = (walletAddress: string, privateKey: string): string => `
✅ *Your wallet has been created successfully*

*Wallet Address:*
\`${walletAddress}\`

*Private Key:*
\`${privateKey}\`

⚠️ *IMPORTANT:* Keep your private key safe and secure
• Do not share it with anyone
• Do not store it digitally or online
• Write it down and store it safely

⏰ This message will be deleted in 5 minutes for security

To start trading, use the /start command.`;

export const walletCreationFailMessage = `❌ *Wallet Creation Failed*

Something went wrong. Please try again or go to /help.`;

export const walletMessage = (
  walletAddress: string,
  ethBalance: string
): string => `*💰 Wallet:* \`${walletAddress}\`

*Balance:*: ${ethBalance} ETH

To deposit funds, please send your coins to the wallet address above.`;

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
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId) return;

    const user = await UserService.getUserByTelegramId(telegramId);
    if (!user) return;

    // Check if user has a wallet
    if (!user.wallets || user.wallets.length === 0) {
      await ctx.reply(createWalletMessage, {
        parse_mode: 'Markdown',
        reply_markup: createWalletKeyboard,
      });
      return;
    }

    // User has wallet, show wallet details
    const api = new NeuroDexApi();
    const ethBalance = await api.getEthBalance(user.wallets[0].address);

    const existingWalletMessage = walletMessage(user.wallets[0].address, ethBalance.data || '0');

    await ctx.reply(existingWalletMessage, {
      parse_mode: 'Markdown',
      reply_markup: walletKeyboard,
    });
  },
};

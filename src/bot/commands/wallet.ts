import { InlineKeyboard } from 'grammy';

import { ViemService } from '@/services/engine/viem.service';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

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

*Balance:* ${ethBalance} ETH

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
    // validate user
    const { isValid, user } = await validateUserAndWallet(ctx);
    if (!isValid || !user?.wallets?.[0]) return;

    // get eth balance
    const viemService = new ViemService();
    const walletAddress = user.wallets[0].address as `0x${string}`;
    const ethBalance = await viemService.getNativeBalance(walletAddress);
    const balance = ethBalance || '0.000';

    const message = ctx.t('wallet_msg', {
      walletAddress,
      ethBalance: balance,
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: walletKeyboard,
    });
  },
};

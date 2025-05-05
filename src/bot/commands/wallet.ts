import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { InlineKeyboard } from 'grammy';

const newWalletMessage = `

You don't have a wallet yet. Please click a button below to create a new wallet.

We never store your private keys or any other sensitive information.

`;

const existingWalletMessage = `

Ethereum Wallets
0x343E3c9be02e5ceCa6CA4461F94D242967870949
Label: W1 · 🅴 ✅
Balance: 0 ETH ($0.00)

`;

const keyboard = new InlineKeyboard().text('Create', 'create_new_wallet');

export const walletCommandHandler: CommandHandler = {
  command: 'wallet',
  description: 'Create or view the wallet',
  handler: async (ctx: BotContext): Promise<void> => {
    // TODO: add database check if user has a wallet | For now dummy check
    const hasWallet = false;

    if (hasWallet) {
      await ctx.reply(existingWalletMessage);
    } else {
      await ctx.reply(newWalletMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    }
  },
};

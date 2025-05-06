import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { InlineKeyboard } from 'grammy';
import { IS_NEW_USER, USER_HAS_WALLET } from '../../config/mock';
import { deleteBotMessage } from '../../utils/deleteMessage';

////////////////////////////////////////////////////////////
// Wallet creation successful
////////////////////////////////////////////////////////////
export const walletCreationOKMessage = `✅ *Wallet Created*

*Wallet address:*
\`0x1D1479C185d32EB90533a08b36B3CFa5F84A0E6B\`

*Private key:*
\`eeca075f8cdf75586252f630ebb043d3591a47e2ddb36a76ab3c6d9589ccdb63\`

Keep your private key safe. Do not store it anywhere digitally or online.

*Save your private key. This message will be deleted in 5 minutes.*

To start trading, add funds to your wallet:`;

export const depositKeyboard = new InlineKeyboard().text('Deposit', 'deposit_funds');

export const walletCreationFailMessage = `❌ *Wallet Creation Failed*

Something went wrong. Please try again or go to /help.`;

// TODO: Here must be the logic to get the total net worth from the database
const randomTotalNetWorth = (Math.random() * 100000).toFixed(2);

export const walletMessage = `*💰 Wallet:* \`0x1D1479C185d32EB90533a08b36B3CFa5F84A0E6B\`

*Balance:*
- ETH: 1.50
- SOL: 2,054
- BRO: 190,000,000

*Total Net Worth:*
- $${randomTotalNetWorth}

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
  description: 'Create or view the wallet',
  handler: async (ctx: BotContext): Promise<void> => {
    // TODO: add database check if user has a wallet | For now dummy check

    if (!IS_NEW_USER && USER_HAS_WALLET) {
      await ctx.reply(walletMessage, {
        parse_mode: 'Markdown',
        reply_markup: walletKeyboard,
      });
    } else {
      const message = await ctx.reply(walletCreationOKMessage, {
        parse_mode: 'Markdown',
        reply_markup: createWalletKeyboard,
      });
      await deleteBotMessage(ctx, message.message_id, 10000);
    }
  },
};

import { CommandHandler } from '@/types/commands';
import { InlineKeyboard } from 'grammy';
import { BotContext } from '@/types/config';
import { IS_NEW_USER, USER_HAS_WALLET } from '@/config/mock';
import { createWalletKeyboard } from './wallet';

// Generate random balance between $0 and $10000, formatted to 2 decimal places
const randomBalance = (Math.random() * 10000).toFixed(2);

export const depositMessage = `📥 *Deposit ETH or Tokens*

Your balance: $${randomBalance}

Send ETH or any ERC-20 token to your wallet: \`0x343E3c9be02e5ceCa6CA4461F94D242967870949\`

*Important*:
- Only send assets on the Base Network
- ETH deposits usually confirm within minutes
- Never share your private key with anyone`;

export const depositKeyboard = new InlineKeyboard()
  .text('Refresh', 'refresh')
  .row()
  .text('← Back', 'back_start');

export const depositCommandHandler: CommandHandler = {
  command: 'deposit',
  description: 'Display your wallet address for deposits',
  handler: async (ctx: BotContext): Promise<void> => {
    if (IS_NEW_USER || !USER_HAS_WALLET) {
      await ctx.reply("⚠️ You don't have a wallet yet.\n\nYou need to create a new wallet first:", {
        parse_mode: 'Markdown',
        reply_markup: createWalletKeyboard,
      });
      return;
    }

    await ctx.reply(depositMessage, {
      parse_mode: 'Markdown',
      reply_markup: depositKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  },
};

export default depositCommandHandler;

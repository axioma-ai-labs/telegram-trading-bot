import { InlineKeyboard } from 'grammy';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { createWalletKeyboard } from '@/bot/commands/wallet';
import { UserService } from '@/services/db/user.service';
import { NeuroDexApi } from '@/services/engine/neurodex';

export const depositMessage = `📥 *Deposit ETH or Tokens*

ETH: {ethBalance}    

Send ETH or any ERC-20 token to your wallet: \`{walletAddress}\`

*Important*:
- Only send assets on the Base Network
- ETH deposits usually confirm within minutes
- Never share your private key with anyone`;

export const depositKeyboard = new InlineKeyboard()
  .text('← Back', 'back_start')
  .text('↺ Refresh', 'refresh_deposit');

export const depositCommandHandler: CommandHandler = {
  command: 'deposit',
  description: 'Display your wallet address for deposits',
  handler: async (ctx: BotContext): Promise<void> => {
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId) return;

    const user = await UserService.getUserByTelegramId(telegramId);
    if (!user) return;

    // Check if user has a wallet
    if (!user.wallets || user.wallets.length === 0) {
      await ctx.reply("⚠️ You don't have a wallet yet.\n\nYou need to create a new wallet first:", {
        parse_mode: 'Markdown',
        reply_markup: createWalletKeyboard,
      });
      return;
    }

    const neurodex = new NeuroDexApi();
    const balance = await neurodex.getEthBalance(telegramId);

    const message = depositMessage
      .replace('{ethBalance}', balance.data || '0.000')
      .replace('{walletAddress}', user.wallets[0].address);

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: depositKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  },
};

export default depositCommandHandler;

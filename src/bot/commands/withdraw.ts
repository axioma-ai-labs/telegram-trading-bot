import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { InlineKeyboard } from 'grammy';
import { IS_NEW_USER, USER_HAS_WALLET } from '@/config/mock';
import { createWalletKeyboard } from '@/bot/commands/wallet';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { NeuroDexApi } from '@/services/engine/neurodex';

export let withdrawMessage = `📤 *Withdraw ETH or other tokens*

Your balance: 
- ETH: {ethBalance}

*Important*:
- Double check the receiving address
- Withdrawals usually confirm within minutes
- Never share your private key with anyone`;

export const withdrawKeyboard = new InlineKeyboard().text('← Back', 'back_wallet');

export const withdrawCommandHandler: CommandHandler = {
  command: 'withdraw',
  description: 'Withdraw tokens',
  handler: async (ctx: BotContext): Promise<void> => {
    if (IS_NEW_USER || !USER_HAS_WALLET) {
      await ctx.reply("⚠️ You don't have a wallet yet.\n\nYou need to create a new wallet first:", {
        parse_mode: 'Markdown',
        reply_markup: createWalletKeyboard,
      });
      return;
    }

    const api = new NeuroDexApi();
    const ethBalance = await api.getEthBalance(ctx.from?.id.toString() || '');
    withdrawMessage = withdrawMessage.replace('{ethBalance}', ethBalance.data || '0');

    const message = await ctx.reply(withdrawMessage, {
      parse_mode: 'Markdown',
      reply_markup: withdrawKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });

    await deleteBotMessage(ctx, message.message_id, 30000);
  },
};

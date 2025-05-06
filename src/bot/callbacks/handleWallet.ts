import { USER_HAS_WALLET } from '@/config/mock';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { BotContext } from '@/types/config';
import {
  walletMessage,
  walletCreationOKMessage,
  walletCreationFailMessage,
  walletKeyboard,
  depositKeyboard,
} from '../commands/wallet';

export async function handleCreateWallet(ctx: BotContext): Promise<void> {
  // Case 1: Wallet already exists
  if (USER_HAS_WALLET) {
    await ctx.editMessageText(walletMessage, {
      parse_mode: 'Markdown',
      reply_markup: walletKeyboard,
    });
    return;
  } else {
    try {
      await ctx.editMessageText(walletCreationOKMessage, {
        parse_mode: 'Markdown',
        reply_markup: depositKeyboard,
      });
    } catch (error) {
      console.error('Error creating wallet');
      const message = await ctx.reply(walletCreationFailMessage, { parse_mode: 'Markdown' });
      await deleteBotMessage(ctx, message.message_id, 10000);
    }
  }
}

import { BotContext } from '@/types/config';
import { depositMessage, depositKeyboard } from '@/bot/commands/deposit';
import { walletMessage, walletKeyboard } from '@/bot/commands/wallet';
import { transactionsMessage, transactionsKeyboard } from '@/bot/commands/transactions';

// Handle refresh callback
export async function handleRefresh(ctx: BotContext): Promise<void> {
  const callbackData = ctx.callbackQuery?.data;

  if (!callbackData) {
    console.error('No callback data provided');
    return;
  }

  let updatedMessage: string;
  let keyboard;

  switch (callbackData) {
    case 'refresh_deposit': {
      // TODO: Add logic to fetch deposit balance from the database
      const randomBalance = (Math.random() * 10000).toFixed(2);
      updatedMessage = depositMessage.replace(/\$(\d+\.\d+)/, `$${randomBalance}`);
      keyboard = depositKeyboard;
      break;
    }
    case 'refresh_wallet': {
      // TODO: Add logic to fetch wallet balance and net worth from the database
      const randomNetWorth = (Math.random() * 100000).toFixed(2);
      updatedMessage = walletMessage.replace(/\$(\d+\.\d+)/, `$${randomNetWorth}`);
      keyboard = walletKeyboard;
      break;
    }
    case 'refresh_transactions': {
      // TODO: Add logic to fetch transactions from the database
      updatedMessage = transactionsMessage;
      keyboard = transactionsKeyboard;
      break;
    }
    default: {
      console.error('Invalid refresh callback');
      return;
    }
  }

  await ctx.editMessageText(updatedMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
    link_preview_options: { is_disabled: true },
  });
}

import { BotContext } from '@/types/config';
import {
  allTransactionsMessage,
  allTransactionKeyboard,
  transactionsMessage,
  transactionsKeyboard,
} from '@/bot/commands/transactions';

export async function viewTransactions(ctx: BotContext): Promise<void> {
  // TODO: Fetch actual transactions from database
  await ctx.editMessageText(transactionsMessage, {
    parse_mode: 'Markdown',
    reply_markup: transactionsKeyboard,
  });
}

export async function viewAllTransactions(ctx: BotContext): Promise<void> {
  // TODO: Fetch actual transactions from database
  await ctx.editMessageText(allTransactionsMessage, {
    parse_mode: 'Markdown',
    reply_markup: allTransactionKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}

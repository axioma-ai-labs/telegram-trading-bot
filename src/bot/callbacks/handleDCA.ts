import { BotContext, GasPriority } from '@/types/config';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { UserService } from '@/services/db/user.service';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { formatInterval } from '@/utils/formatters';
import { config } from '@/config/config';
import {
  no_wallet_message,
  not_registered_message,
  dcaTokenMessage,
  custom_amount_prompt,
  invalid_amount_message,
} from '../commands/dca';

const dca_success_message = (
  amount: number,
  token: string,
  interval: string,
  times: number,
  orderHash: string
): string =>
  `✅ DCA order created successfully!\n\n` +
  `Order details:\n` +
  `• Amount: ${amount} ETH\n` +
  `• Token: ${token}\n` +
  `• Interval: ${interval}\n` +
  `• Times: ${times}\n` +
  `• Order Hash: ${orderHash}\n\n` +
  `You can view your DCA orders using /orders`;

export async function dcaToken(ctx: BotContext): Promise<void> {
  if (!ctx.from?.id) {
    return;
  }

  const telegramId = ctx.from.id.toString();
  const user = await UserService.getUserByTelegramId(telegramId);
  const USER_HAS_WALLET = user?.wallets && user.wallets.length > 0;
  const IS_REGISTERED = user !== null;

  if (!IS_REGISTERED) {
    const message = await ctx.reply(not_registered_message);
    await deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  if (!USER_HAS_WALLET) {
    const message = await ctx.reply(no_wallet_message);
    await deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // Initialize DCA operation
  ctx.session.currentOperation = {
    type: 'dca',
  };

  await ctx.reply(dcaTokenMessage, {
    parse_mode: 'Markdown',
  });
}

export async function retrieveDcaAmount(ctx: BotContext, amount: string): Promise<void> {
  if (!ctx.from?.id) return;
  console.log('AMOUNT:', amount);

  const telegramId = ctx.from.id.toString();
  const user = await UserService.getUserByTelegramId(telegramId);
  const settings = user?.settings;
  const USER_HAS_WALLET = user?.wallets && user.wallets.length > 0;
  const IS_REGISTERED = user !== null;
  const { currentOperation } = ctx.session;

  if (!IS_REGISTERED) {
    const message = await ctx.reply(not_registered_message);
    await deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  if (!USER_HAS_WALLET) {
    const message = await ctx.reply(no_wallet_message);
    await deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // Handle custom amount selection
  if (amount === 'custom') {
    await ctx.reply(custom_amount_prompt, {
      parse_mode: 'Markdown',
    });
    return;
  }

  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    const message = await ctx.reply(invalid_amount_message);
    await deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  ctx.session.currentOperation = {
    ...currentOperation,
    type: 'dca',
    amount: parsedAmount,
  };
}

export async function retrieveDcaInterval(ctx: BotContext, interval: string): Promise<void> {
  console.log('INTERVAL:', interval);
}

export async function retrieveDcaTimes(ctx: BotContext, times: string): Promise<void> {
  console.log('TIMES:', times);
}

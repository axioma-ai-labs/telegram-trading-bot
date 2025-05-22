import { BotContext } from '@/types/config';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { buyTokenMessage } from '@/bot/commands/buy';
import { UserService } from '@/services/prisma/user.service';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { BuyParams } from '@/types/neurodex';

const error_message = '❌ Transaction failed. Please try again later.';
const invalid_amount_message = '❌ Invalid amount selected. Please try again.';
const insufficient_funds_message =
  '❌ Insufficient funds to complete the transaction.\n\nPlease ensure you have enough ETH to cover:\n• The transaction amount\n• Gas fees';
const no_wallet_message = "❌ You don't have a wallet.\n\nPlease use /wallet to create one.";
const not_registered_message = '❌ You are not registered.\n\nPlease use /start to begin.';
const invalid_token_message = '❌ No token selected. Please select a token first.';
const custom_amount_prompt = 'Please enter the amount of ETH you want to spend:';
const transaction_success_message = (amount: number, token: string, txHash: string): string =>
  `✅ Buy order for ${amount} ETH on ${token} was successful!\n\n` +
  `Transaction details:\n` +
  `• Amount: ${amount} ETH\n` +
  `• Token: ${token}\n` +
  `• Transaction: https://basescan.org/tx/${txHash}`;

export async function buyToken(ctx: BotContext): Promise<void> {
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

  ctx.session.waitingForToken = true;
  await ctx.reply(buyTokenMessage, {
    parse_mode: 'Markdown',
  });
}

export async function performBuy(ctx: BotContext, amount: string): Promise<void> {
  if (!ctx.from?.id) return;

  const telegramId = ctx.from.id.toString();
  const user = await UserService.getUserByTelegramId(telegramId);
  const settings = user?.settings;
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

  if (!ctx.session.selectedToken) {
    const message = await ctx.reply(invalid_token_message);
    await deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  // Handle custom amount selection
  if (amount === 'custom') {
    await ctx.reply(custom_amount_prompt, {
      parse_mode: 'Markdown',
    });
    ctx.session.waitingForAmount = true;
    return;
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    const message = await ctx.reply(invalid_amount_message);
    await deleteBotMessage(ctx, message.message_id, 10000);
    return;
  }

  try {
    const params: BuyParams = {
      toTokenAddress: ctx.session.selectedToken,
      fromAmount: parsedAmount,
      slippage: Number(settings?.slippage || '1'),
      gasPriority: 'standard',
      walletAddress: user.wallets[0].address,
      privateKey: '0x7a90c3db06fc0d3d87d04b84ce06fc95fbf1bfd245e88d065da0fe54f206310a',
      referrer: '0x8159F8156cD0F89114f72cD915b7b4BD7e83Ad4D',
    };

    const neurodex = new NeuroDexApi();
    const buyResult = await neurodex.buy(params);

    // if success
    if (buyResult.success && buyResult.data?.txHash) {
      const message = transaction_success_message(
        parsedAmount,
        ctx.session.selectedToken,
        buyResult.data.txHash
      );
      await ctx.reply(message, {
        parse_mode: 'Markdown',
      });
    } else {
      // check if no mooooooooney
      const errorMessage = buyResult.error?.toLowerCase() || '';
      if (errorMessage.includes('insufficient funds')) {
        const message = await ctx.reply(insufficient_funds_message);
        await deleteBotMessage(ctx, message.message_id, 10000);

        // TODO: check for other stuff
      } else {
        const message = await ctx.reply(error_message);
        await deleteBotMessage(ctx, message.message_id, 10000);
      }
    }
  } catch (error) {
    console.error('Error during buy transaction:', error);
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
    if (errorMessage.includes('insufficient funds')) {
      const message = await ctx.reply(insufficient_funds_message);
      await deleteBotMessage(ctx, message.message_id, 10000);
    } else {
      const message = await ctx.reply(error_message);
      await deleteBotMessage(ctx, message.message_id, 10000);
    }
  }
}

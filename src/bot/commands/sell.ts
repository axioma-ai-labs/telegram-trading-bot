import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { InlineKeyboard } from 'grammy';
import { NeuroDexResponse, TokenData } from '@/types/neurodex';
import { validateUserAndWallet } from '@/utils/userValidation';

export const sellTokenMessage = `Enter token contract address to sell:`;
export const error_message = '❌ Transaction failed. Please try again later.';
export const invalid_amount_message = '❌ Invalid amount selected. Please try again.';
export const insufficient_funds_message =
  '❌ Insufficient token balance to complete the transaction.\n\nPlease ensure you have enough tokens to sell and ETH for gas fees.';
export const no_wallet_message = "❌ You don't have a wallet.\n\nPlease use /wallet to create one.";
export const not_registered_message = '❌ You are not registered.\n\nPlease use /start to begin.';
export const invalid_token_message = '❌ No token selected. Please select a token first.';
export const custom_amount_prompt = 'Please enter the amount of tokens you want to sell:';

export const sellTokenFoundMessage = (tokenData: NeuroDexResponse<TokenData>): string => `
✅ *Token Found*

Symbol: *$${tokenData.data?.symbol}*
Name: *${tokenData.data?.name || 'Unknown'}*
Price: $${tokenData.data?.price || 'Unknown'}
Chain: ${tokenData.data?.chain || 'Unknown'}

Please select how much ${tokenData.data?.symbol} you want to sell.

Go to /settings to adjust slippage and gas if the transaction fails.
`;

export const confirmSellMessage = (
  tokenAddress: string,
  tokenSymbol: string,
  tokenName: string,
  amount: number
): string => `
🔍 *Confirm Sell Order*

Token: *${tokenSymbol}* | ${tokenName}
CA: \`${tokenAddress}\`
Amount: *${amount} ${tokenSymbol}*

Are you sure you want to proceed with this sale?
`;

export const sellTokenKeyboard = new InlineKeyboard()
  .text('25%', 'sell_amount_25')
  .text('50%', 'sell_amount_50')
  .text('75%', 'sell_amount_75')
  .row()
  .text('100%', 'sell_amount_100')
  .row()
  .text('Custom', 'sell_amount_custom');

export const confirmSellKeyboard = new InlineKeyboard()
  .text('✅ Confirm', 'sell_confirm')
  .text('❌ Cancel', 'sell_cancel');

export const sellCommandHandler: CommandHandler = {
  command: 'sell',
  description: 'Sell a token',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid } = await validateUserAndWallet(ctx);
    if (!isValid) return;

    ctx.session.currentOperation = { type: 'sell' };

    await ctx.reply(sellTokenMessage, {
      parse_mode: 'Markdown',
    });
  },
};

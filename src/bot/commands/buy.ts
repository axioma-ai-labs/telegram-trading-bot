import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { InlineKeyboard } from 'grammy';
import { NeuroDexResponse, TokenData } from '@/types/neurodex';
import { validateUserAndWallet } from '@/utils/userValidation';

export const buyTokenMessage = `Enter token contract address to buy:`;
export const error_message = '❌ Transaction failed. Please try again later.';
export const invalid_amount_message = '❌ Invalid amount selected. Please try again.';
export const insufficient_funds_message =
  '❌ Insufficient funds to complete the transaction.\n\nPlease ensure you have enough ETH to cover:\n• The transaction amount\n• Gas fees';
export const no_wallet_message = "❌ You don't have a wallet.\n\nPlease use /wallet to create one.";
export const not_registered_message = '❌ You are not registered.\n\nPlease use /start to begin.';
export const invalid_token_message = '❌ No token selected. Please select a token first.';
export const custom_amount_prompt = 'Please enter the amount of ETH you want to spend:';

export const buyTokenFoundMessage = (tokenData: NeuroDexResponse<TokenData>): string => `
✅ *Token Found*

Symbol: *$${tokenData.data?.symbol}*
Name: *${tokenData.data?.name || 'Unknown'}*
Price: $${tokenData.data?.price || 'Unknown'}
Chain: ${tokenData.data?.chain || 'Unknown'}

Please select how much ETH you want to spend on ${tokenData.data?.symbol}.

Go to /settings to adjust slippage and gas if the transaction fails.
`;

export const buyTokenKeyboard = new InlineKeyboard()
  .text('0.1 ETH', 'buy_amount_0.1')
  .text('0.2 ETH', 'buy_amount_0.2')
  .text('1 ETH', 'buy_amount_1')
  .row()
  .text('2 ETH', 'buy_amount_2')
  .text('5 ETH', 'buy_amount_5')
  .row()
  .text('Custom', 'buy_amount_custom');

export const buyCommandHandler: CommandHandler = {
  command: 'buy',
  description: 'Buy a token',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid } = await validateUserAndWallet(ctx);
    if (!isValid) return;

    ctx.session.currentOperation = { type: 'buy' };

    await ctx.reply(buyTokenMessage, {
      parse_mode: 'Markdown',
    });
  },
};

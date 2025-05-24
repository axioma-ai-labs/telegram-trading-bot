import { BotContext } from '@/types/config';
import { CommandHandler } from '@/types/commands';
import { NeuroDexResponse, TokenData } from '@/types/neurodex';
import { InlineKeyboard } from 'grammy';
import { formatInterval } from '@/utils/formatters';
import { validateUserAndWallet } from '@/utils/userValidation';
import { getDcaOrders } from '@/bot/callbacks/handleDCA';

export const dcaTokenMessage = 'Please send contract address of the token you want to DCA:';
export const error_message = '❌ Transaction failed. Please try again later.';
export const error_dca_message = '❌ Failed to create DCA order. Please try again later.';
export const invalid_amount_message = '❌ Invalid amount selected. Please try again.';
export const insufficient_funds_message = '❌ Insufficient funds to complete the transaction.';
export const no_wallet_message = "❌ You don't have a wallet.\n\nPlease use /wallet to create one.";
export const not_registered_message = '❌ You are not registered.\n\nPlease use /start to begin.';
export const invalid_token_message = '❌ No token selected. Please select a token first.';
export const custom_amount_message = 'Please enter the amount of ETH you want to spend:';
export const custom_interval_message = 'Please enter the interval in hours:';
export const custom_times_message = 'Please enter the number of times (1-100) for your DCA order:';
export const invalid_interval_message = '❌ Invalid interval selected. Please try again.';
export const invalid_times_message =
  '❌ Invalid number of intervals. Please enter a number between 1 and 100.';

export const dcaTokenFoundMessage = (tokenData: NeuroDexResponse<TokenData>): string => `
✅ *Token Found*

Symbol: *$${tokenData.data?.symbol}*
Name: *${tokenData.data?.name || 'Unknown'}*
Price: $${tokenData.data?.price || 'Unknown'}
Chain: ${tokenData.data?.chain || 'Unknown'}

Please select how much ETH you want to spend on $${tokenData.data?.symbol} for your DCA order.

Go to /settings to adjust slippage and gas if the transaction fails.
`;

export const intervalMessage = 'Please select the interval time for your DCA order:';

export const dcaTokenKeyboard = new InlineKeyboard()
  .text('0.1 ETH', 'dca_amount_0.1')
  .text('0.2 ETH', 'dca_amount_0.2')
  .text('1 ETH', 'dca_amount_1')
  .row()
  .text('2 ETH', 'dca_amount_2')
  .text('5 ETH', 'dca_amount_5')
  .row()
  .text('Custom', 'dca_amount_custom');

export const intervalKeyboard = new InlineKeyboard()
  .text('1 hour', 'dca_interval_3600')
  .text('1 day', 'dca_interval_86400')
  .text('1 week', 'dca_interval_604800')
  .text('1 month', 'dca_interval_2592000')
  .row()
  .text('Custom', 'dca_interval_custom');

export const timesKeyboard = new InlineKeyboard()
  .text('5', 'dca_times_5')
  .text('10', 'dca_times_10')
  .text('15', 'dca_times_15')
  .text('20', 'dca_times_20')
  .text('30', 'dca_times_30')
  .row()
  .text('Custom', 'dca_times_custom');

export const timesMessage = 'Please select the number of times for your DCA order:';

export const confirmDcaMessage = (
  token: string,
  tokenSymbol: string,
  tokenName: string,
  amount: number,
  interval: number,
  times: number
): string => `
⚡️ *DCA Order Summary:*

*Token:* ${tokenSymbol} | ${tokenName}
*CA:* \`${token}\`
*Amount:* ${amount} ETH
*Interval:* ${formatInterval(interval)}
*Times:* ${times}

Please confirm to create the DCA order:`;

export const confirmDcaKeyboard = new InlineKeyboard()
  .text('✅ Confirm', 'dca_confirm')
  .text('❌ Cancel', 'dca_cancel');

export const dcaCommandHandler: CommandHandler = {
  command: 'dca',
  description: 'Create a DCA order',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid } = await validateUserAndWallet(ctx);
    if (!isValid) return;

    ctx.session.currentOperation = { type: 'dca' };

    await ctx.reply(dcaTokenMessage, {
      parse_mode: 'Markdown',
    });
  },
};

export const dcaOrdersCommandHandler: CommandHandler = {
  command: 'orders',
  description: 'Get DCA orders',
  handler: async (ctx: BotContext): Promise<void> => {
    await getDcaOrders(ctx);
  },
};

import { UserService } from '@/services/db/user.service';
import { createWalletMessage } from './wallet';
import { createWalletKeyboard } from './wallet';
import { BotContext } from '@/types/config';
import { CommandHandler } from '@/types/commands';
import { NeuroDexResponse, TokenData } from '@/types/neurodex';
import { InlineKeyboard } from 'grammy';
export const dcaTokenMessage = 'Please send contract address of the token you want to DCA:';
export const error_message = '❌ Transaction failed. Please try again later.';
export const invalid_amount_message = '❌ Invalid amount selected. Please try again.';
export const insufficient_funds_message = '❌ Insufficient funds to complete the transaction.';
export const no_wallet_message = "❌ You don't have a wallet.\n\nPlease use /wallet to create one.";
export const not_registered_message = '❌ You are not registered.\n\nPlease use /start to begin.';
export const invalid_token_message = '❌ No token selected. Please select a token first.';
export const custom_amount_prompt = 'Please enter the amount of ETH you want to spend:';
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

export const dcaTokenKeyboard = new InlineKeyboard()
  .text('0.1 ETH', 'dca_amount_0.1')
  .text('0.2 ETH', 'dca_amount_0.2')
  .text('1 ETH', 'dca_amount_1')
  .row()
  .text('2 ETH', 'dca_amount_2')
  .text('5 ETH', 'dca_amount_5')
  .row()
  .text('Custom', 'dca_amount_custom');

export const dcaCommandHandler: CommandHandler = {
  command: 'dca',
  description: 'Create a DCA order',
  handler: async (ctx: BotContext): Promise<void> => {
    if (!ctx.from?.id) return;

    const telegramId = ctx.from.id.toString();
    const user = await UserService.getUserByTelegramId(telegramId);
    const USER_HAS_WALLET = user?.wallets && user.wallets.length > 0;

    if (!USER_HAS_WALLET) {
      await ctx.reply(createWalletMessage, {
        parse_mode: 'Markdown',
        reply_markup: createWalletKeyboard,
      });
    } else {
      // Initialize DCA operation
      ctx.session.currentOperation = {
        type: 'dca',
      };

      await ctx.reply(dcaTokenMessage, {
        parse_mode: 'Markdown',
      });
    }
  },
};

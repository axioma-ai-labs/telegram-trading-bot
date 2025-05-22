import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { createWalletMessage, createWalletKeyboard } from '@/bot/commands/wallet';
import { UserService } from '@/services/prisma/user.service';
import { InlineKeyboard } from 'grammy';
import { NeuroDexResponse, TokenData } from '@/types/neurodex';

export const buyTokenMessage = `Enter token contract address to buy:`;

export const tokenFoundMessage = (tokenData: NeuroDexResponse<TokenData>): string => `
✅ *Token Found*

Symbol: *$${tokenData.data?.symbol}*
Name: *${tokenData.data?.name || 'Unknown'}*
Price: $${tokenData.data?.price || 'Unknown'}
Chain: ${tokenData.data?.chain || 'Unknown'}

Please select how much ETH you want to spend on ${tokenData.data?.symbol}.

Go to /settings to adjust slippage and gas if the transaction fails.
`;

export const buyTokenKeyboard = new InlineKeyboard()
  .text('0.1 ETH', 'amount_0.1')
  .text('0.2 ETH', 'amount_0.2')
  .text('1 ETH', 'amount_1')
  .row()
  .text('2 ETH', 'amount_2')
  .text('5 ETH', 'amount_5')
  .row()
  .text('Custom', 'amount_custom');

export const buyCommandHandler: CommandHandler = {
  command: 'buy',
  description: 'Buy a token',
  handler: async (ctx: BotContext): Promise<void> => {
    if (!ctx.from?.id) {
      return;
    }

    const telegramId = ctx.from.id.toString();
    const user = await UserService.getUserByTelegramId(telegramId);
    const USER_HAS_WALLET = user?.wallets && user.wallets.length > 0;

    if (!USER_HAS_WALLET) {
      await ctx.reply(createWalletMessage, {
        parse_mode: 'Markdown',
        reply_markup: createWalletKeyboard,
      });
    } else {
      await ctx.reply(buyTokenMessage, {
        parse_mode: 'Markdown',
      });
      ctx.session.waitingForToken = true; // Waiting for token input from the user
    }
  },
};

import { BotContext } from '../../types/config';
import { CommandHandler } from '../../types/commands';
import { InlineKeyboard } from 'grammy';
import { IS_NEW_USER } from '../../config/mock';

export const startMessage = `
*💸 Neurodex*

Neurodex is your lightning fast crypto trading bot

Buy and sell crypto with ease using Neurodex.

/buy - Buy any crypto token on Base, Binance Smart Chain & Ethereum
/sell - Sell any crypto token on Base, Binance Smart Chain & Ethereum
/wallet - Manage your wallet
/settings - Configure your bot settings
/help - Get help and support

Powered by [Neurobro](https://neurobro.ai) | [Docs](https://docs.neurodex.xyz)
`;

export const startKeyboard = new InlineKeyboard()
  .text('Buy', 'buy')
  .text('Sell', 'sell')
  .row()
  .text('Wallet', 'create_wallet')
  .text('Withdraw', 'withdraw')
  .text('Deposit', 'deposit')
  .row()
  .text('⚙️ Settings', 'open_settings')
  .text('💬 Help', 'get_help');

////////////////////////////////////////////////////////////
// New User
////////////////////////////////////////////////////////////

const newUserStartMessage = `
*💸 Neurodex*

Neurodex is your lightning fast crypto trading bot

To get started, you have to create a new wallet. Please create one now by clicking the button below.

For any help setting up please refer to [this guide](https://docs.neurodex.xyz/getting-started/setup) or get /help.
`;

const newUserStartKeyboard = new InlineKeyboard()
  .text('💵 Create Wallet', 'create_wallet')
  .row()
  .text('⬅ Back', 'back_start');

export const startCommandHandler: CommandHandler = {
  command: 'start',
  description: 'Start the bot',
  handler: async (ctx: BotContext): Promise<void> => {
    // Update session data
    ctx.session.userId = ctx.from?.id;
    ctx.session.username = ctx.from?.username;
    ctx.session.lastInteractionTime = Date.now();

    // TODO: Add user check if user exists in database
    if (IS_NEW_USER) {
      await ctx.reply(newUserStartMessage, {
        parse_mode: 'Markdown',
        reply_markup: newUserStartKeyboard,
      });
    } else {
      await ctx.reply(startMessage, {
        parse_mode: 'Markdown',
        reply_markup: startKeyboard,
        link_preview_options: {
          is_disabled: true,
        },
      });
    }
  },
};

import { BotContext } from '@/types/config';
import { CommandHandler } from '@/types/commands';
import { InlineKeyboard } from 'grammy';
import { isUserRegistered, hasWallet } from '@/utils/checkUser';
import { UserService } from '@/services/db/user.service';
import { SettingsService } from '@/services/db/settings.service';

export const startMessage = `
*💸 Neurodex*

Neurodex is your lightning fast crypto trading bot

Buy and sell crypto with ease using Neurodex.

/buy - Buy any crypto token on Base, BSC & Ethereum
/sell - Sell any crypto token on Base, BSC & Ethereum
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

export const newUserStartMessage = `
*💸 Neurodex*

Neurodex is your lightning fast crypto trading bot

To be able to /buy, /sell or do any other actions, you have to create a wallet first. Create one now by clicking the button below.

For any help setting up please refer to [this guide](https://docs.neurodex.xyz/getting-started/setup) or get /help.
`;

export const newUserStartKeyboard = new InlineKeyboard().text('💵 Create Wallet', 'create_wallet');

export const startCommandHandler: CommandHandler = {
  command: 'start',
  description: 'Start the bot',
  handler: async (ctx: BotContext): Promise<void> => {
    if (!ctx.from?.id) {
      return;
    }
    const telegramId = ctx.from.id.toString();
    const IS_REGISTERED = await isUserRegistered(telegramId);
    const USER_HAS_WALLET = await hasWallet(telegramId);

    if (!IS_REGISTERED || !USER_HAS_WALLET) {
      // New user without wallet
      await UserService.upsertUser(telegramId, {
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
      });
      await SettingsService.upsertSettings(telegramId, {
        language: 'en',
        autoTrade: false,
        proMode: false,
        gasPriority: 'medium',
        slippage: '0.5',
      });
      console.log('New user created:', telegramId);

      await ctx.reply(newUserStartMessage, {
        parse_mode: 'Markdown',
        reply_markup: newUserStartKeyboard,
      });
      return;
    }

    // Existing user with wallet
    console.log('Existing user:', telegramId);
    await ctx.reply(startMessage, {
      parse_mode: 'Markdown',
      reply_markup: startKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  },
};

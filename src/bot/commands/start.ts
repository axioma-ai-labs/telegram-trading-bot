import { BotContext } from '../../types/config';
import { CommandHandler } from '../../types/commands';
import { InlineKeyboard } from 'grammy';

const startMessage = `
*Neurotrading Bot*

Welcome to Neurotrading Bot - your lightning fast trading bot for crypto!

To get started, you have to create a new wallet. Navigate to /wallet to create a new wallet.

`;

const keyboard = new InlineKeyboard()
  .text('💵 Wallet', 'open_wallet')
  .text('💰 Balance', 'check_balance')
  .text('⚙️ Settings', 'open_settings')
  .text('💬 Help', 'get_help');
export const startCommandHandler: CommandHandler = {
  command: 'start',
  description: 'Start the bot',
  handler: async (ctx: BotContext): Promise<void> => {
    // Update session data
    ctx.session.userId = ctx.from?.id;
    ctx.session.username = ctx.from?.username;
    ctx.session.lastInteractionTime = Date.now();

    await ctx.reply(startMessage, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });
  },
};

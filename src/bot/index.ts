import { Bot } from 'grammy';
import { session } from 'grammy';
import config from '../config/config';
import { BotContext, SessionData } from '../types/config';
import { startCommandHandler } from './commands/start';
import { helpCommandHandler } from './commands/help';
import { walletCommandHandler } from './commands/wallet';
/**
 * Creates and configures the Telegram bot instance.
 * @returns {Bot<BotContext>}
 */
export const createBot = (): Bot<BotContext> => {
  const bot = new Bot<BotContext>(config.telegramBotToken);

  // Add session middleware with proper typing
  bot.use(
    session({
      initial: (): SessionData => ({
        startTime: Date.now(),
        lastInteractionTime: Date.now(),
      }),
    })
  );

  // Register callback handlers
  bot.on('callback_query', (ctx) => {
    const { data } = ctx.callbackQuery;
    if (data === 'create_new_wallet') {
      // TODO: add logic for wallet creation in a new method + verification
      ctx.reply('Creating new wallet...', {
        parse_mode: 'Markdown',
      });
    }
  });

  // Register commands
  bot.command(startCommandHandler.command, startCommandHandler.handler); // /start
  bot.command(helpCommandHandler.command, helpCommandHandler.handler); // /help
  bot.command(walletCommandHandler.command, walletCommandHandler.handler); // /wallet

  // Set commands (quick access)
  bot.api.setMyCommands([
    { command: startCommandHandler.command, description: startCommandHandler.description },
    { command: helpCommandHandler.command, description: helpCommandHandler.description },
    { command: walletCommandHandler.command, description: walletCommandHandler.description },
  ]);

  // Error handling
  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    console.error(err.error);
  });

  return bot;
};

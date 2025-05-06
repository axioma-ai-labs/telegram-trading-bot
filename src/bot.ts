import { Bot } from 'grammy';
import { session } from 'grammy';
import config from '@/config/config';
import { BotContext, SessionData } from '@/types/config';
import { startCommandHandler } from '@/bot/commands/start';
import { helpCommandHandler } from '@/bot/commands/help';
import { walletCommandHandler } from '@/bot/commands/wallet';
import { handleCreateWallet } from '@/bot/callbacks/handleWallet';
import { handleGetHelp } from '@/bot/callbacks/getHelp';
import { returnBack } from '@/bot/callbacks/returnBack';
import { buyToken } from './bot/callbacks/buyToken';
import { sellToken } from './bot/callbacks/sellToken';
import { refreshMessage } from './bot/callbacks/refresh';
import {
  handleConfigureSettings,
  handleSetSlippage,
  handleSetLanguage,
  handleSetGas,
} from '@/bot/callbacks/configureSettings';
import { startMessage, startKeyboard } from '@/bot/commands/start';
import { settingsMessage, settingsKeyboard, settingsCommandHandler } from '@/bot/commands/settings';
import { walletMessage, walletKeyboard } from '@/bot/commands/wallet';
import {
  transactionsMessage,
  transactionsKeyboard,
  transactionsCommandHandler,
} from '@/bot/commands/transactions';
import { viewAllTransactions, viewTransactions } from './bot/callbacks/getTransactions';
import depositCommandHandler from './bot/commands/deposit';
import { depositFunds } from './bot/callbacks/depositFunds';
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

// Callback handlers
bot.on('callback_query', async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  if (!callbackData) return;

  if (callbackData === 'create_wallet') {
    await handleCreateWallet(ctx);
    return;
  }

  if (callbackData === 'refresh') {
    await refreshMessage(ctx);
    return;
  }

  if (callbackData === 'buy') {
    await buyToken(ctx);
    return;
  }

  if (callbackData === 'sell') {
    await sellToken(ctx);
    return;
  }

  if (callbackData === 'deposit') {
    await depositFunds(ctx);
    return;
  }

  if (callbackData === 'get_help') {
    await handleGetHelp(ctx);
    return;
  }

  if (callbackData === 'back_start') {
    await returnBack(ctx, startMessage, startKeyboard);
    return;
  }

  if (callbackData === 'back_settings') {
    await returnBack(ctx, settingsMessage, settingsKeyboard);
    return;
  }

  if (callbackData === 'back_wallet') {
    await returnBack(ctx, walletMessage, walletKeyboard);
    return;
  }

  if (callbackData === 'back_transactions') {
    await returnBack(ctx, transactionsMessage, transactionsKeyboard);
    return;
  }

  if (callbackData === 'view_transactions') {
    await viewTransactions(ctx);
    return;
  }

  if (callbackData === 'view_all_transactions') {
    await viewAllTransactions(ctx);
    return;
  }

  // Settings handlers
  if (callbackData === 'open_settings') {
    await handleConfigureSettings(ctx);
    return;
  }

  if (callbackData === 'set_slippage') {
    await handleSetSlippage(ctx);
    return;
  }

  if (callbackData === 'set_language') {
    await handleSetLanguage(ctx);
    return;
  }

  if (callbackData === 'set_gas') {
    await handleSetGas(ctx);
    return;
  }

  // Handle slippage selection
  if (callbackData.startsWith('slippage_')) {
    const slippage = callbackData.split('_')[1];
    // TODO: Save slippage setting
    await ctx.answerCallbackQuery(`Slippage set to ${slippage}%`);
    await handleConfigureSettings(ctx);
    return;
  }

  // Handle language selection
  if (callbackData.startsWith('lang_')) {
    const lang = callbackData.split('_')[1];
    // TODO: Save language setting
    await ctx.answerCallbackQuery(`Language set to ${lang}`);
    await handleConfigureSettings(ctx);
    return;
  }

  // Handle gas priority selection
  if (callbackData.startsWith('gas_')) {
    const priority = callbackData.split('_')[1];
    // TODO: Save gas priority setting
    await ctx.answerCallbackQuery(`Gas priority set to ${priority}`);
    await handleConfigureSettings(ctx);
    return;
  }
});

// Register commands
bot.command(startCommandHandler.command, startCommandHandler.handler); // /start
bot.command(helpCommandHandler.command, helpCommandHandler.handler); // /help
bot.command(walletCommandHandler.command, walletCommandHandler.handler); // /wallet
bot.command(settingsCommandHandler.command, settingsCommandHandler.handler); // /settings
bot.command(transactionsCommandHandler.command, transactionsCommandHandler.handler); // /transactions
bot.command(depositCommandHandler.command, depositCommandHandler.handler); // /deposit
// Set commands (quick access)
bot.api.setMyCommands([
  { command: startCommandHandler.command, description: startCommandHandler.description },
  { command: helpCommandHandler.command, description: helpCommandHandler.description },
  { command: walletCommandHandler.command, description: walletCommandHandler.description },
  { command: settingsCommandHandler.command, description: settingsCommandHandler.description },
  { command: depositCommandHandler.command, description: depositCommandHandler.description },
  {
    command: transactionsCommandHandler.command,
    description: transactionsCommandHandler.description,
  },
]);

// Error handling
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  console.error(err.error);
});

// Run the bot
const main = async (): Promise<void> => {
  try {
    if (config.environment === 'development') {
      console.log(`🚧 Starting ${config.projectName} in ${config.environment} mode...`);
    } else {
      console.log(`🚀 Starting ${config.projectName} in ${config.environment} mode...`);
    }

    // Start the bot
    await bot.start();
    console.log('Bot started successfully!');
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
};

main();

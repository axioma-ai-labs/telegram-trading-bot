import { Bot } from 'grammy';
import { session } from 'grammy';
import { config } from '@/config/config';
import { BotContext, SessionData } from '@/types/config';
import { startCommandHandler } from '@/bot/commands/start';
import { helpCommandHandler } from '@/bot/commands/help';
import { walletCommandHandler } from '@/bot/commands/wallet';
import { handleCreateWallet } from '@/bot/callbacks/handleWallet';
import { handleGetHelp } from '@/bot/callbacks/getHelp';
import { handleBackNavigation } from '@/bot/callbacks/returnBack';
import { buyToken, performBuy } from '@/bot/callbacks/buyToken';
import { sellToken } from '@/bot/callbacks/sellToken';
import { handleRefresh } from '@/bot/callbacks/refresh';
import {
  handleConfigureSettings,
  handleSetSlippage,
  handleSetLanguage,
  handleSetGas,
  updateSlippage,
  updateGasPriority,
  updateLanguage,
} from '@/bot/callbacks/configureSettings';
import { settingsCommandHandler } from '@/bot/commands/settings';
import { transactionsCommandHandler } from '@/bot/commands/transactions';
import { viewAllTransactions, viewTransactions } from '@/bot/callbacks/getTransactions';
import depositCommandHandler from '@/bot/commands/deposit';
import { depositFunds } from '@/bot/callbacks/depositFunds';
import { buyCommandHandler, buyTokenKeyboard, tokenFoundMessage } from '@/bot/commands/buy';
import { sellCommandHandler } from '@/bot/commands/sell';
import { withdrawCommandHandler } from '@/bot/commands/withdraw';
import { withdrawFunds } from '@/bot/callbacks/withdrawFunds';
import { referralCommandHandler } from '@/bot/commands/referrals';
import { getReferralLink, getReferralStats } from '@/bot/callbacks/handleReferrals';
import { acceptTermsConditions } from '@/bot/callbacks/acceptTermsConditions';
import { NeuroDexApi } from './services/engine/neurodex';
import { deleteBotMessage } from './utils/deleteMessage';

const bot = new Bot<BotContext>(config.telegramBotToken);

// Add session middleware with proper typing
bot.use(
  session({
    initial: (): SessionData => ({
      startTime: Date.now(),
      lastInteractionTime: Date.now(),
      waitingForToken: false,
      waitingForAmount: false,
      selectedToken: '',
    }),
  })
);

// Mapping of callback handlers
const CALLBACK_HANDLERS: Record<string, (ctx: BotContext) => Promise<void>> = {
  create_wallet: handleCreateWallet,
  refresh_deposit: handleRefresh,
  refresh_wallet: handleRefresh,
  refresh_transactions: handleRefresh,
  withdraw: withdrawFunds,
  buy: buyToken,
  sell: sellToken,
  deposit: depositFunds,
  get_help: handleGetHelp,
  view_transactions: viewTransactions,
  view_all_transactions: viewAllTransactions,
  open_settings: handleConfigureSettings,
  set_slippage: handleSetSlippage,
  set_language: handleSetLanguage,
  set_gas: handleSetGas,
  get_referral_link: getReferralLink,
  get_referral_stats: getReferralStats,
  accept_terms_conditions: acceptTermsConditions,
};

// Parameterized handlers
const PARAMETERIZED_HANDLERS: Record<string, (ctx: BotContext, param: string) => Promise<void>> = {
  slippage: async (ctx, param) => {
    await updateSlippage(ctx, param);
  },
  lang: async (ctx, param) => {
    await updateLanguage(ctx, param);
  },
  gas: async (ctx, param) => {
    await updateGasPriority(ctx, param);
  },
  amount: async (ctx, param) => {
    await performBuy(ctx, param);
  },
};

// Callback handlers
bot.on('callback_query', async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  if (!callbackData) return;

  // 1) Navigation (back buttons)
  if (await handleBackNavigation(ctx, callbackData)) {
    return;
  }

  // 2) Parameterized callbacks
  const [prefix, param] = callbackData.split('_');
  if (PARAMETERIZED_HANDLERS[prefix]) {
    await PARAMETERIZED_HANDLERS[prefix](ctx, param);
    return;
  }

  // 3) Regular callbacks
  const handler = CALLBACK_HANDLERS[callbackData];
  console.log('callbackData: ', callbackData);
  if (handler) {
    await handler(ctx);
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
bot.command(buyCommandHandler.command, buyCommandHandler.handler); // /buy
bot.command(sellCommandHandler.command, sellCommandHandler.handler); // /sell
bot.command(withdrawCommandHandler.command, withdrawCommandHandler.handler); // /withdraw
bot.command(referralCommandHandler.command, referralCommandHandler.handler); // /referrals

// Set commands (quick access)
bot.api.setMyCommands([
  { command: startCommandHandler.command, description: startCommandHandler.description },
  { command: helpCommandHandler.command, description: helpCommandHandler.description },
  { command: walletCommandHandler.command, description: walletCommandHandler.description },
  { command: settingsCommandHandler.command, description: settingsCommandHandler.description },
  { command: depositCommandHandler.command, description: depositCommandHandler.description },
  { command: buyCommandHandler.command, description: buyCommandHandler.description },
  { command: sellCommandHandler.command, description: sellCommandHandler.description },
  { command: withdrawCommandHandler.command, description: withdrawCommandHandler.description },
  {
    command: transactionsCommandHandler.command,
    description: transactionsCommandHandler.description,
  },
  { command: referralCommandHandler.command, description: referralCommandHandler.description },
]);

// Handle token input for buy command
bot.on('message:text', async (ctx) => {
  // Case 1: Waiting for token input
  if (ctx.session.waitingForToken) {
    const tokenInput = ctx.message.text;
    if (!tokenInput) return;

    // Reset the waiting state
    ctx.session.waitingForToken = false;

    try {
      const neurodex = new NeuroDexApi();
      const tokenData = await neurodex.getTokenDataByContractAddress(tokenInput, 'base');

      // Set the waiting state for amount input
      ctx.session.waitingForAmount = true;
      ctx.session.selectedToken = tokenInput;

      await ctx.reply(tokenFoundMessage(tokenData), {
        parse_mode: 'Markdown',
        reply_markup: buyTokenKeyboard,
      });
    } catch (error) {
      const not_found_message = `❌ Token not found. Please check the token contract address and try again.`;
      await ctx.reply(not_found_message, {
        parse_mode: 'Markdown',
      });
      ctx.session.waitingForToken = true; // Re-enable (wait for next attempt)
    }

    // Case 2: Waiting for amount input
  } else if (ctx.session.waitingForAmount) {
    const amountInput = ctx.message.text;
    if (!amountInput) return;

    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      const invalid_amount_message = await ctx.reply(
        '❌ Invalid amount. Please enter a valid number greater than 0.'
      );
      await deleteBotMessage(ctx, invalid_amount_message.message_id);
      ctx.session.waitingForAmount = true;
      return;
    }
    ctx.session.waitingForAmount = false;
    await performBuy(ctx, amountInput);
  }
});

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

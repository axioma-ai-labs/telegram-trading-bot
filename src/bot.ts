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
import { buyCommandHandler, buyTokenKeyboard, buyTokenFoundMessage } from '@/bot/commands/buy';
import { sellCommandHandler } from '@/bot/commands/sell';
import { withdrawCommandHandler } from '@/bot/commands/withdraw';
import { withdrawFunds } from '@/bot/callbacks/withdrawFunds';
import { referralCommandHandler } from '@/bot/commands/referrals';
import { getReferralLink, getReferralStats } from '@/bot/callbacks/handleReferrals';
import { acceptTermsConditions } from '@/bot/callbacks/acceptTermsConditions';
import { limit } from '@grammyjs/ratelimiter';
import { NeuroDexApi } from './services/engine/neurodex';
import { deleteBotMessage } from './utils/deleteMessage';
import { dcaCommandHandler, dcaTokenFoundMessage, dcaTokenKeyboard } from './bot/commands/dca';
import {
  dcaToken,
  retrieveDcaAmount,
  retrieveDcaInterval,
  retrieveDcaTimes,
} from './bot/callbacks/handleDCA';
import { InlineKeyboard } from 'grammy';
import { formatInterval } from './utils/formatters';

const bot = new Bot<BotContext>(config.telegramBotToken);

// Add session middleware with proper typing
bot.use(
  session({
    initial: (): SessionData => ({
      startTime: Date.now(),
      lastInteractionTime: Date.now(),
      currentOperation: null,
    }),
  })
);

// Rate limiting middleware
// 1. 3 requests per second
bot.use(
  limit({
    timeFrame: 1000,
    limit: 3,
    onLimitExceeded: async (ctx) => {
      await ctx.reply('Please slow down! Maximum 3 requests per second.');
    },
  })
);

// 2. 50 requests per minute
bot.use(
  limit({
    timeFrame: 60 * 1000, // 1 minute in ms
    limit: 50,
    onLimitExceeded: async (ctx) => {
      await ctx.reply('You have exceeded the limit of 50 requests per minute. Please wait.');
    },
    keyPrefix: 'minute',
  })
);

// 3. 300 requests per 15 minutes
bot.use(
  limit({
    timeFrame: 15 * 60 * 1000, // 15 minutes in ms
    limit: 300,
    onLimitExceeded: async (ctx) => {
      await ctx.reply('You have exceeded the limit of 300 requests per 15 minutes. Please wait.');
    },
    keyPrefix: '15min',
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
  dca: dcaToken,
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
  buy_amount: async (ctx, param) => {
    await performBuy(ctx, param);
  },
  dca_amount: async (ctx, param) => {
    await retrieveDcaAmount(ctx, param);
  },
  dca_interval: async (ctx, param) => {
    await retrieveDcaInterval(ctx, param);
  },
  dca_times: async (ctx, param) => {
    await retrieveDcaTimes(ctx, param);
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
  const lastUnderscoreIndex = callbackData.lastIndexOf('_');
  const prefix = callbackData.slice(0, lastUnderscoreIndex);
  const param = callbackData.slice(lastUnderscoreIndex + 1);
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
bot.command(dcaCommandHandler.command, dcaCommandHandler.handler); // /dca

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
  { command: dcaCommandHandler.command, description: dcaCommandHandler.description },
]);

// Handle token input for buy command
bot.on('message:text', async (ctx) => {
  const { currentOperation } = ctx.session;
  console.log('Current Operation/d: ', currentOperation);
  console.log(
    'Parameterized Handlers: ',
    currentOperation?.type,
    currentOperation?.token,
    currentOperation?.amount,
    currentOperation?.interval,
    currentOperation?.times,
    currentOperation?.customInterval
  );
  if (!currentOperation) return;

  const userInput = ctx.message.text;
  if (!userInput) return;

  switch (currentOperation.type) {
    case 'buy':
      if (!currentOperation.token) {
        // Handle token input
        try {
          const neurodex = new NeuroDexApi();
          const tokenData = await neurodex.getTokenDataByContractAddress(userInput, 'base');

          ctx.session.currentOperation = {
            type: 'buy',
            token: userInput,
          };

          await ctx.reply(buyTokenFoundMessage(tokenData), {
            parse_mode: 'Markdown',
            reply_markup: buyTokenKeyboard,
          });
        } catch (error) {
          await ctx.reply(
            '❌ Token not found. Please check the token contract address and try again.',
            {
              parse_mode: 'Markdown',
            }
          );
        }
      } else if (!currentOperation.amount) {
        // Handle amount input
        const parsedAmount = parseFloat(userInput);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          const invalid_amount_message = await ctx.reply(
            '❌ Invalid amount. Please enter a valid number greater than 0.'
          );
          await deleteBotMessage(ctx, invalid_amount_message.message_id);
          return;
        }
        await performBuy(ctx, parsedAmount.toString());
        ctx.session.currentOperation = null;
      }
      break;

    case 'dca':
      if (!currentOperation.token) {
        // Handle DCA token input
        try {
          const neurodex = new NeuroDexApi();
          const tokenData = await neurodex.getTokenDataByContractAddress(userInput, 'base');

          ctx.session.currentOperation = {
            type: 'dca',
            token: userInput,
          };

          await ctx.reply(dcaTokenFoundMessage(tokenData), {
            parse_mode: 'Markdown',
            reply_markup: dcaTokenKeyboard,
          });
        } catch (error) {
          await ctx.reply(
            '❌ Token not found. Please check the token contract address and try again.',
            {
              parse_mode: 'Markdown',
            }
          );
        }
      } else if (!currentOperation.amount) {
        // Handle DCA amount input
        const parsedAmount = parseFloat(userInput);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          const invalid_amount_message = await ctx.reply(
            '❌ Invalid amount. Please enter a valid number greater than 0.'
          );
          await deleteBotMessage(ctx, invalid_amount_message.message_id);
          return;
        }

        // Update operation state
        ctx.session.currentOperation = {
          ...currentOperation,
          amount: parsedAmount,
        };

        // Show interval selection keyboard
        const keyboard = new InlineKeyboard()
          .text('1 Hour', 'dca_interval_3600')
          .text('1 Day', 'dca_interval_86400')
          .row()
          .text('1 Week', 'dca_interval_604800')
          .text('Custom', 'dca_interval_custom');

        await ctx.reply('Please select the interval time for your DCA order:', {
          reply_markup: keyboard,
        });
      } else if (currentOperation.customInterval) {
        // Handle custom interval input
        const intervalHours = parseFloat(userInput);
        if (isNaN(intervalHours) || intervalHours <= 0) {
          const message = await ctx.reply(
            '❌ Invalid interval. Please enter a valid number of hours.'
          );
          await deleteBotMessage(ctx, message.message_id, 10000);
          return;
        }

        // Update operation state
        ctx.session.currentOperation = {
          ...currentOperation,
          interval: intervalHours * 3600, // Convert to seconds
          customInterval: false,
        };

        await ctx.reply(
          'Please enter the number of intervals (1-100):\n\n' +
            'This will determine how many times the order will be executed.'
        );
      } else if (!currentOperation.times) {
        // Handle DCA times input
        const times = parseInt(userInput);
        if (isNaN(times) || times < 1 || times > 100) {
          const message = await ctx.reply(
            '❌ Invalid number of intervals. Please enter a number between 1 and 100.'
          );
          await deleteBotMessage(ctx, message.message_id, 10000);
          return;
        }

        // Update operation state
        ctx.session.currentOperation = {
          ...currentOperation,
          times,
        };

        // Show summary and confirmation keyboard
        const keyboard = new InlineKeyboard()
          .text('✅ Confirm', 'dca_confirm')
          .text('❌ Cancel', 'dca_cancel');

        await ctx.reply(
          `📊 DCA Order Summary:\n\n` +
            `Token: ${currentOperation.token}\n` +
            `Amount: ${currentOperation.amount}\n` +
            `Interval: ${formatInterval(currentOperation.interval || 0)}\n` +
            `Times: ${times}\n\n` +
            `Please confirm to create the DCA order:`,
          { reply_markup: keyboard }
        );
      }
      break;
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

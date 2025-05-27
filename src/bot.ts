import { limit } from '@grammyjs/ratelimiter';
import { Bot } from 'grammy';
import { session } from 'grammy';

import { acceptTermsConditions } from '@/bot/callbacks/acceptTermsConditions';
import { buyCancel, buyConfirm, buyToken, performBuy } from '@/bot/callbacks/buyToken';
import {
  handleConfigureSettings,
  handleSetGas,
  handleSetLanguage,
  handleSetSlippage,
  updateGasPriority,
  updateLanguage,
  updateSlippage,
} from '@/bot/callbacks/configureSettings';
import { depositFunds } from '@/bot/callbacks/depositFunds';
import { handleGetHelp } from '@/bot/callbacks/getHelp';
import { viewAllTransactions, viewTransactions } from '@/bot/callbacks/getTransactions';
import { getReferralLink, getReferralStats } from '@/bot/callbacks/handleReferrals';
import { handleCreateWallet, handleStartTrading } from '@/bot/callbacks/handleWallet';
import { handleRefresh } from '@/bot/callbacks/refresh';
import { handleBackNavigation } from '@/bot/callbacks/returnBack';
import { performSell, sellCancel, sellConfirm, sellToken } from '@/bot/callbacks/sellToken';
import {
  performWithdraw,
  withdrawCancel,
  withdrawConfirm,
  withdrawFunds,
} from '@/bot/callbacks/withdrawFunds';
import { buyCommandHandler } from '@/bot/commands/buy';
import depositCommandHandler from '@/bot/commands/deposit';
import { helpCommandHandler } from '@/bot/commands/help';
import { referralCommandHandler } from '@/bot/commands/referrals';
import { sellCommandHandler } from '@/bot/commands/sell';
import { settingsCommandHandler } from '@/bot/commands/settings';
import { startCommandHandler } from '@/bot/commands/start';
import { transactionsCommandHandler } from '@/bot/commands/transactions';
import { walletCommandHandler } from '@/bot/commands/wallet';
import { withdrawCommandHandler } from '@/bot/commands/withdraw';
import { handleBuyMessages } from '@/bot/messages/buyMessages';
import { handleDcaMessages } from '@/bot/messages/dcaMessages';
import { handleLimitMessages } from '@/bot/messages/limitMessages';
import { handleSellMessages } from '@/bot/messages/sellMessages';
import { handlePkVerificationMessages } from '@/bot/messages/walletMessages';
import { handleWithdrawMessages } from '@/bot/messages/withdrawMessages';
import { config } from '@/config/config';
import logger from '@/config/logger';
import { I18nService } from '@/services/i18n/i18n.service';
import { BotContext, SessionData } from '@/types/telegram';

import {
  dcaCancel,
  dcaConfirm,
  dcaToken,
  getDcaOrders,
  retrieveDcaAmount,
  retrieveDcaInterval,
  retrieveDcaTimes,
} from './bot/callbacks/handleDCA';
import {
  cancelLimitOrder,
  getLimitOrders,
  limitCancel,
  limitConfirm,
  limitToken,
  retrieveLimitAmount,
  retrieveLimitExpiry,
} from './bot/callbacks/handleLimitOrders';
import { dcaCommandHandler, dcaOrdersCommandHandler } from './bot/commands/dca';
import { limitCommandHandler, limitOrdersCommandHandler } from './bot/commands/limit';

export const bot = new Bot<BotContext>(config.telegramBotToken);

// initialize bot
async function initializeBot(): Promise<void> {
  const i18n = await I18nService.initialize();

  // session middleware
  bot.use(
    session({
      initial: (): SessionData => ({
        startTime: Date.now(),
        lastInteractionTime: Date.now(),
        currentOperation: null,
        currentMessage: null,
      }),
    })
  );

  // i18n middleware
  bot.use(i18n);

  // Rate limiting middleware
  // 1. 3 requests per second
  bot.use(
    limit({
      timeFrame: 1000,
      limit: 3,
      onLimitExceeded: async (ctx) => {
        await ctx.reply(ctx.t('rate_limit_second_msg'));
      },
    })
  );

  // 2. 50 requests per minute
  bot.use(
    limit({
      timeFrame: 60 * 1000, // 1 minute in ms
      limit: 50,
      onLimitExceeded: async (ctx) => {
        await ctx.reply(ctx.t('rate_limit_minute_msg'));
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
        await ctx.reply(ctx.t('rate_limit_15min_msg'));
      },
      keyPrefix: '15min',
    })
  );

  // Mapping of callback handlers
  const CALLBACK_HANDLERS: Record<string, (ctx: BotContext) => Promise<void>> = {
    start_trading: handleStartTrading,
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
    get_dca_orders: getDcaOrders,
    dca_confirm: dcaConfirm,
    dca_cancel: dcaCancel,
    buy_confirm: buyConfirm,
    buy_cancel: buyCancel,
    sell_confirm: sellConfirm,
    sell_cancel: sellCancel,
    withdraw_confirm: withdrawConfirm,
    withdraw_cancel: withdrawCancel,
    limit: limitToken,
    get_limit_orders: getLimitOrders,
    limit_confirm: limitConfirm,
    limit_cancel: limitCancel,
    refresh_limit_orders: getLimitOrders,
    lang_en: (ctx) => updateLanguage(ctx, 'en'),
    lang_ru: (ctx) => updateLanguage(ctx, 'ru'),
    lang_de: (ctx) => updateLanguage(ctx, 'de'),
    lang_fr: (ctx) => updateLanguage(ctx, 'fr'),
  };

  // Parameterized handlers
  const PARAMETERIZED_HANDLERS: Record<string, (ctx: BotContext, param: string) => Promise<void>> =
    {
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
      sell_amount: async (ctx, param) => {
        await performSell(ctx, param);
      },
      withdraw_amount: async (ctx, param) => {
        await performWithdraw(ctx, param);
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
      limit_amount: async (ctx, param) => {
        await retrieveLimitAmount(ctx, param);
      },
      limit_expiry: async (ctx, param) => {
        await retrieveLimitExpiry(ctx, param);
      },
      cancel_limit: async (ctx, param) => {
        await cancelLimitOrder(ctx, param);
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
    logger.info('🟧 CALLBACK DATA:', callbackData);
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
  bot.command(dcaOrdersCommandHandler.command, dcaOrdersCommandHandler.handler); // /get_dca_orders
  bot.command(limitCommandHandler.command, limitCommandHandler.handler); // /limit
  bot.command(limitOrdersCommandHandler.command, limitOrdersCommandHandler.handler); // /limitorders

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
    { command: limitCommandHandler.command, description: limitCommandHandler.description },
    {
      command: limitOrdersCommandHandler.command,
      description: limitOrdersCommandHandler.description,
    },
  ]);

  // Handle token input for buy command
  bot.on('message:text', async (ctx) => {
    const { currentOperation } = ctx.session;
    const userInput = ctx.message.text;
    if (!userInput) return;
    if (!currentOperation) return;

    switch (currentOperation.type) {
      case 'buy':
        await handleBuyMessages(ctx, userInput, currentOperation);
        break;

      case 'sell':
        await handleSellMessages(ctx, userInput, currentOperation);
        break;

      case 'limit':
        await handleLimitMessages(ctx, userInput, currentOperation);
        break;

      case 'dca':
        await handleDcaMessages(ctx, userInput, currentOperation);
        break;

      case 'pk_verification':
        await handlePkVerificationMessages(ctx, userInput, currentOperation);
        break;

      case 'withdraw':
        await handleWithdrawMessages(ctx, userInput, currentOperation);
        break;
    }

    logger.info('🟧 OPERATION:', ctx.session.currentOperation);
  });

  // Error handling
  bot.catch((err) => {
    const ctx = err.ctx;
    logger.error(`Error while handling update ${ctx.update.update_id}:`);
    logger.error(err.error);
  });
}

// Run the bot
const main = async (): Promise<void> => {
  try {
    // Initialize bot with i18n
    await initializeBot();

    if (config.environment === 'development') {
      logger.info(`🚧 Starting ${config.projectName} in ${config.environment} mode...`);
    } else {
      logger.info(`🚀 Starting ${config.projectName} in ${config.environment} mode...`);
    }

    // Start the bot
    await bot.start();
    logger.info('Bot started successfully!');
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
};

main();

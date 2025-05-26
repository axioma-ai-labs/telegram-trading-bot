import {
  gasKeyboard,
  languageKeyboard,
  settingsKeyboard,
  settingsMessage,
  slippageKeyboard,
} from '@/bot/commands/settings';
import logger from '@/config/logger';
import { SettingsService } from '@/services/prisma/settings';
import { BotContext } from '@/types/telegram';
import { getGasPriorityName, getLanguageName, getSlippageName } from '@/utils/settingsGetters';
import { validateUserAndWallet } from '@/utils/userValidation';

export async function handleConfigureSettings(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  const message = settingsMessage(
    getSlippageName(user?.settings?.slippage || '1'),
    getLanguageName(user?.settings?.language || 'en'),
    getGasPriorityName(user?.settings?.gasPriority || 'standard')
  );

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: settingsKeyboard,
  });
}

// slippage options
export async function handleSetSlippage(ctx: BotContext): Promise<void> {
  await ctx.editMessageText(
    '*📊 Set Slippage Tolerance*\n\nSelect your preferred slippage tolerance:',
    {
      parse_mode: 'Markdown',
      reply_markup: slippageKeyboard,
    }
  );
}

// language options
export async function handleSetLanguage(ctx: BotContext): Promise<void> {
  await ctx.editMessageText('*🌎 Select Language*\n\nChoose your preferred language:', {
    parse_mode: 'Markdown',
    reply_markup: languageKeyboard,
  });
}

// gas options
export async function handleSetGas(ctx: BotContext): Promise<void> {
  await ctx.editMessageText('*⛽ Set Gas Priority*\n\nSelect your preferred gas priority:', {
    parse_mode: 'Markdown',
    reply_markup: gasKeyboard,
  });
}

// Parameterized handlers to actually update settings

// Update slippage
export const updateSlippage = async (ctx: BotContext, slippage: string): Promise<void> => {
  // validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid || !user) return;

  await SettingsService.updateSlippage(user.id, slippage);
  logger.info(`Slippage set to ${getSlippageName(slippage)}`);
  await ctx.answerCallbackQuery(`Slippage set to ${getSlippageName(slippage)}`);
  await ctx.editMessageText(
    settingsMessage(
      getSlippageName(slippage),
      getLanguageName(user.settings?.language || 'en'),
      getGasPriorityName(user.settings?.gasPriority || 'standard')
    ),
    {
      parse_mode: 'Markdown',
      reply_markup: settingsKeyboard,
    }
  );
};

// Update gas priority
export const updateGasPriority = async (ctx: BotContext, gasPriority: string): Promise<void> => {
  // validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid || !user) return;

  await SettingsService.updateGasPriority(user.id, gasPriority);
  await ctx.answerCallbackQuery(`Gas priority set to ${getGasPriorityName(gasPriority)}`);
  await ctx.editMessageText(
    settingsMessage(
      getSlippageName(user.settings?.slippage || '1'),
      getLanguageName(user.settings?.language || 'en'),
      getGasPriorityName(gasPriority)
    ),
    {
      parse_mode: 'Markdown',
      reply_markup: settingsKeyboard,
    }
  );
};

// Update language
export const updateLanguage = async (ctx: BotContext, language: string): Promise<void> => {
  // validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid || !user) return;

  await SettingsService.updateLanguage(user.id, language);
  await ctx.answerCallbackQuery(`Language set to ${getLanguageName(language)}`);
  await ctx.editMessageText(
    settingsMessage(
      getSlippageName(user.settings?.slippage || '1'),
      getLanguageName(language),
      getGasPriorityName(user.settings?.gasPriority || 'standard')
    ),
    {
      parse_mode: 'Markdown',
      reply_markup: settingsKeyboard,
    }
  );
};

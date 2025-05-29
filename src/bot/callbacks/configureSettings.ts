import {
  gasKeyboard,
  languageKeyboard,
  settingsKeyboard,
  slippageKeyboard,
} from '@/bot/commands/settings';
import logger from '@/config/logger';
import { I18nService } from '@/services/i18n/i18n';
import { SettingsService } from '@/services/prisma/settings';
import { BotContext } from '@/types/telegram';
import { getGasPriorityName, getLanguageName, getSlippageName } from '@/utils/settingsGetters';
import { validateUser } from '@/utils/userValidation';

export async function handleConfigureSettings(ctx: BotContext): Promise<void> {
  // validate user
  const user = await validateUser(ctx);

  const message = ctx.t('settings_msg', {
    slippage: getSlippageName(user.settings?.slippage || '1'),
    language: getLanguageName(user.settings?.language || 'en'),
    gasPriority: getGasPriorityName(user.settings?.gasPriority || 'standard'),
  });

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: settingsKeyboard,
  });
}

// slippage options
export async function handleSetSlippage(ctx: BotContext): Promise<void> {
  await ctx.editMessageText(ctx.t('set_slippage_msg'), {
    parse_mode: 'Markdown',
    reply_markup: slippageKeyboard,
  });
}

// language options
export async function handleSetLanguage(ctx: BotContext): Promise<void> {
  await ctx.editMessageText(ctx.t('set_language_msg'), {
    parse_mode: 'Markdown',
    reply_markup: languageKeyboard,
  });
}

// gas options
export async function handleSetGas(ctx: BotContext): Promise<void> {
  await ctx.editMessageText(ctx.t('set_gas_msg'), {
    parse_mode: 'Markdown',
    reply_markup: gasKeyboard,
  });
}

// Parameterized handlers to actually update settings

// Update slippage
export const updateSlippage = async (ctx: BotContext, slippage: string): Promise<void> => {
  // validate user
  const user = await validateUser(ctx);

  await SettingsService.updateSlippage(user.id, slippage);
  logger.info(`Slippage set to ${getSlippageName(slippage)}`);
  await ctx.answerCallbackQuery(
    ctx.t('slippage_updated_msg', { slippage: getSlippageName(slippage) })
  );
  await ctx.editMessageText(
    ctx.t('settings_msg', {
      slippage: getSlippageName(slippage),
      language: getLanguageName(user.settings?.language || 'en'),
      gasPriority: getGasPriorityName(user.settings?.gasPriority || 'standard'),
    }),
    {
      parse_mode: 'Markdown',
      reply_markup: settingsKeyboard,
    }
  );
};

// Update gas priority
export const updateGasPriority = async (ctx: BotContext, gasPriority: string): Promise<void> => {
  // validate user
  const user = await validateUser(ctx);

  await SettingsService.updateGasPriority(user.id, gasPriority);
  await ctx.answerCallbackQuery(
    ctx.t('gas_priority_updated_msg', { gasPriority: getGasPriorityName(gasPriority) })
  );

  const message = ctx.t('settings_msg', {
    slippage: getSlippageName(user.settings?.slippage || '1'),
    language: getLanguageName(user.settings?.language || 'en'),
    gasPriority: getGasPriorityName(gasPriority),
  });

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: settingsKeyboard,
  });
};

// Update language
export const updateLanguage = async (ctx: BotContext, language: string): Promise<void> => {
  // validate user
  const user = await validateUser(ctx);

  // upd language
  await SettingsService.updateLanguage(user.id, language);

  // upd language in session
  I18nService.updateUserLanguage(ctx, language);

  // confirmation
  await ctx.answerCallbackQuery(
    ctx.t('language_updated_msg', { language: getLanguageName(language) })
  );

  const message = ctx.t('settings_msg', {
    slippage: getSlippageName(user.settings?.slippage || '1'),
    language: getLanguageName(language),
    gasPriority: getGasPriorityName(user.settings?.gasPriority || 'standard'),
  });

  // upd settings message
  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: settingsKeyboard,
  });
};

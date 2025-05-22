import { BotContext } from '@/types/config';
import { SettingsService } from '@/services/prisma/settings.service';
import { UserService } from '@/services/prisma/user.service';
import {
  settingsMessage,
  settingsKeyboard,
  slippageKeyboard,
  languageKeyboard,
  gasKeyboard,
} from '@/bot/commands/settings';
import { getGasPriorityName, getLanguageName, getSlippageName } from '@/utils/settingsGetters';

export async function handleConfigureSettings(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id?.toString();
  if (!telegramId) return;

  const user = await UserService.getUserByTelegramId(telegramId);
  const settings = user?.settings;

  if (!user) {
    await ctx.editMessageText('User not found. Please try again later.', {
      parse_mode: 'Markdown',
    });
    return;
  }

  const message = settingsMessage(
    getSlippageName(settings?.slippage || '1'),
    getLanguageName(settings?.language || 'en'),
    getGasPriorityName(settings?.gasPriority || 'medium')
  );

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: settingsKeyboard,
  });
}

// Update slippage
export async function handleSetSlippage(ctx: BotContext): Promise<void> {
  await ctx.editMessageText(
    '*📊 Set Slippage Tolerance*\n\nSelect your preferred slippage tolerance:',
    {
      parse_mode: 'Markdown',
      reply_markup: slippageKeyboard,
    }
  );
}

// Show language configuration options
export async function handleSetLanguage(ctx: BotContext): Promise<void> {
  await ctx.editMessageText('*🌎 Select Language*\n\nChoose your preferred language:', {
    parse_mode: 'Markdown',
    reply_markup: languageKeyboard,
  });
}

// Show gas priority configuration options
export async function handleSetGas(ctx: BotContext): Promise<void> {
  await ctx.editMessageText('*⛽ Set Gas Priority*\n\nSelect your preferred gas priority:', {
    parse_mode: 'Markdown',
    reply_markup: gasKeyboard,
  });
}

// Parameterized handlers to actually update settings

// Update slippage
export const updateSlippage = async (ctx: BotContext, slippage: string): Promise<void> => {
  const telegramId = ctx.from?.id?.toString();
  if (!telegramId) return;

  const user = await UserService.getUserByTelegramId(telegramId);
  const settings = user?.settings;
  if (!user) return;
  if (!settings) return;

  await SettingsService.updateSlippage(user.id, slippage);
  await ctx.answerCallbackQuery(`Slippage set to ${getSlippageName(slippage)}`);
  await ctx.editMessageText(
    settingsMessage(
      getSlippageName(slippage),
      getLanguageName(settings?.language),
      getGasPriorityName(settings?.gasPriority)
    ),
    {
      parse_mode: 'Markdown',
      reply_markup: settingsKeyboard,
    }
  );
};

// Update gas priority
export const updateGasPriority = async (ctx: BotContext, gasPriority: string): Promise<void> => {
  const telegramId = ctx.from?.id?.toString();
  if (!telegramId) return;

  const user = await UserService.getUserByTelegramId(telegramId);
  const settings = user?.settings;
  if (!user) return;
  if (!settings) return;

  await SettingsService.updateGasPriority(user.id, gasPriority);
  await ctx.answerCallbackQuery(`Gas priority set to ${getGasPriorityName(gasPriority)}`);
  await ctx.editMessageText(
    settingsMessage(
      getSlippageName(settings?.slippage),
      getLanguageName(settings?.language),
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
  const telegramId = ctx.from?.id?.toString();
  if (!telegramId) return;

  const user = await UserService.getUserByTelegramId(telegramId);
  const settings = user?.settings;
  if (!user) return;
  if (!settings) return;

  await SettingsService.updateLanguage(user.id, language);
  await ctx.answerCallbackQuery(`Language set to ${getLanguageName(language)}`);
  await ctx.editMessageText(
    settingsMessage(
      getSlippageName(settings?.slippage),
      getLanguageName(language),
      getGasPriorityName(settings?.gasPriority)
    ),
    {
      parse_mode: 'Markdown',
      reply_markup: settingsKeyboard,
    }
  );
};

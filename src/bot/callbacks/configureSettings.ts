import { BotContext } from '@/types/config';

import {
  settingsMessage,
  settingsKeyboard,
  slippageKeyboard,
  languageKeyboard,
  gasKeyboard,
} from '../commands/settings';

export async function handleConfigureSettings(ctx: BotContext): Promise<void> {
  await ctx.editMessageText(settingsMessage, {
    parse_mode: 'Markdown',
    reply_markup: settingsKeyboard,
  });
}

export async function handleSetSlippage(ctx: BotContext): Promise<void> {
  await ctx.editMessageText(
    '*📊 Set Slippage Tolerance*\n\nSelect your preferred slippage tolerance:',
    {
      parse_mode: 'Markdown',
      reply_markup: slippageKeyboard,
    }
  );
}

export async function handleSetLanguage(ctx: BotContext): Promise<void> {
  await ctx.editMessageText('*🌎 Select Language*\n\nChoose your preferred language:', {
    parse_mode: 'Markdown',
    reply_markup: languageKeyboard,
  });
}

export async function handleSetGas(ctx: BotContext): Promise<void> {
  await ctx.editMessageText('*⛽ Set Gas Priority*\n\nSelect your preferred gas priority:', {
    parse_mode: 'Markdown',
    reply_markup: gasKeyboard,
  });
}

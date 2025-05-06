import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { InlineKeyboard } from 'grammy';

export const settingsMessage = `
*⚙️ Settings*

*Current Settings:*
• Slippage: 1%
• Language: English
• Gas Priority: Medium

*Available Options:*
Supported languages: English, German, French, Russian
Slippage: 0.5%, 1%, 2%, 3%
Gas: Low, Medium, High

Please set your desired settings below.

`;

export const settingsKeyboard = new InlineKeyboard()
  .text('📊 Slippage', 'set_slippage')
  .text('⛽ Gas', 'set_gas')
  .row()
  .text('🌎 Language', 'set_language')
  .row()
  .text('← Back', 'back_start');

export const slippageKeyboard = new InlineKeyboard()
  .text('0.5%', 'slippage_0.5')
  .text('1%', 'slippage_1')
  .row()
  .text('2%', 'slippage_2')
  .text('3%', 'slippage_3')
  .row()
  .text('← Back', 'back_settings');

export const languageKeyboard = new InlineKeyboard()
  .text('🇬🇧 English', 'lang_en')
  .text('🇪🇸 Spanish', 'lang_es')
  .row()
  .text('🇷🇺 Russian', 'lang_ru')
  .text('🇨🇳 Chinese', 'lang_zh')
  .row()
  .text('← Back', 'back_settings');

export const gasKeyboard = new InlineKeyboard()
  .text('🐢 Low', 'gas_low')
  .text('⚡ Medium', 'gas_medium')
  .row()
  .text('🚀 High', 'gas_high')
  .row()
  .text('← Back', 'back_settings');

export const settingsCommandHandler: CommandHandler = {
  command: 'settings',
  description: 'Configure bot settings',
  handler: async (ctx: BotContext): Promise<void> => {
    await ctx.reply(settingsMessage, {
      parse_mode: 'Markdown',
      reply_markup: settingsKeyboard,
    });
  },
};

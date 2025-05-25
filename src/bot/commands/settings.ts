import { InlineKeyboard } from 'grammy';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { SettingsService } from '@/services/prisma/settings';
import { getGasPriorityName, getLanguageName, getSlippageName } from '@/utils/settingsGetters';
import { validateUserAndWallet } from '@/utils/userValidation';

export const settingsMessage = (
  slippage?: string,
  language?: string,
  gasPriority?: string
): string => {
  return `*⚙️ Settings*

*Current Settings:*
• Slippage: ${slippage}
• Language: ${language}
• Gas Priority: ${gasPriority}

*Best Practices:*
- Increase *slippage* to 1% for less liquid tokens
- Set *gas priority* to high for fast transactions

Please set your desired settings below.`;
};

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
  .text('🇻🇳 Vietnamese', 'lang_vi')
  .text('🇮🇩 Indonesian', 'lang_id')
  .row()
  .text('← Back', 'back_settings');

export const gasKeyboard = new InlineKeyboard()
  .text('🐢 Fast', 'gas_fast')
  .text('⚡ Standard', 'gas_standard')
  .row()
  .text('🚀 Instant', 'gas_instant')
  .row()
  .text('← Back', 'back_settings');

export const settingsCommandHandler: CommandHandler = {
  command: 'settings',
  description: 'Configure bot settings',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid, user } = await validateUserAndWallet(ctx);
    if (!isValid || !user) return;

    // If user has no settings, create default settings
    if (!user.settings) {
      await SettingsService.upsertSettings(user.id, {
        language: 'en',
        gasPriority: 'standard',
        slippage: '0.5',
      });

      // After creating settings, send the message with default values
      const message = settingsMessage(
        getSlippageName('0.5'),
        getLanguageName('en'),
        getGasPriorityName('standard')
      );

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: settingsKeyboard,
      });
      return;
    }

    // User has settings, use them directly
    const message = settingsMessage(
      getSlippageName(user.settings.slippage || '1'),
      getLanguageName(user.settings.language || 'en'),
      getGasPriorityName(user.settings.gasPriority || 'standard')
    );

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: settingsKeyboard,
    });
  },
};

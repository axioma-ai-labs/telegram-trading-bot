import { InlineKeyboard } from 'grammy';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { SettingsService } from '@/services/db/settings.service';
import { UserService } from '@/services/db/user.service';
import { getGasPriorityName, getLanguageName, getSlippageName } from '@/utils/settingsGetters';

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
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId) return;

    const user = await UserService.getUserByTelegramId(telegramId);
    if (!user) return;

    const settings = await SettingsService.getUserSettingsByUserId(user.id);
    if (!settings) {
      await SettingsService.upsertSettings(user.id, {
        language: 'en',
        gasPriority: 'medium',
        slippage: '0.5',
      });
    } else {
      const message = settingsMessage(
        getSlippageName(settings?.slippage || '1'),
        getLanguageName(settings?.language || 'en'),
        getGasPriorityName(settings?.gasPriority || 'medium')
      );

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: settingsKeyboard,
      });
    }
  },
};

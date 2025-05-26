import { InlineKeyboard } from 'grammy';

import logger from '@/config/logger';
import { SettingsService } from '@/services/prisma/settings';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

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
  .text('🇷🇺 Русский', 'lang_ru')
  .row()
  .text('🇪🇸 Español', 'lang_es')
  .text('🇩🇪 Deutsch', 'lang_de')
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

      const message = ctx.t('settings_msg', {
        slippage: '0.5',
        language: 'en',
        gasPriority: 'standard',
      });

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: settingsKeyboard,
      });
      return;
    }

    // User has settings, use them directly with i18n
    const message = ctx.t('settings_msg', {
      slippage: user.settings.slippage || '1',
      language: user.settings.language || 'en',
      gasPriority: user.settings.gasPriority || 'standard',
    });

    logger.info('Settings message:', message);

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: settingsKeyboard,
    });
  },
};

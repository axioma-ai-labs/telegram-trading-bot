import { I18n } from '@grammyjs/i18n';
import path from 'path';

import { BotContext } from '@/types/telegram';

/**
 * Simplified internationalization service using grammY's i18n plugin.
 * Supports multiple languages with YAML format translation files.
 */
export class I18nService {
  private static instance: I18n<BotContext>;

  /**
   * Initialize the i18n service with locale files.
   * @returns Configured I18n instance
   */
  static async initialize(): Promise<I18n<BotContext>> {
    if (!this.instance) {
      this.instance = new I18n<BotContext>({
        defaultLocale: 'en',
        useSession: true,

        // Simple locale negotiator
        localeNegotiator: (ctx): string => {
          // 1. Check user session language
          if (ctx.session?.userLanguage) {
            return ctx.session.userLanguage;
          }

          // 2. Check Telegram user language
          if (ctx.from?.language_code) {
            const supportedLanguages = ['en', 'es', 'ru', 'de'];
            const userLang = ctx.from.language_code.toLowerCase();

            if (supportedLanguages.includes(userLang)) {
              return userLang;
            }
          }

          // 3. Default to English
          return 'en';
        },

        // Global context for common variables
        globalTranslationContext: (ctx): Record<string, string> => ({
          name: ctx.from?.first_name || '',
          username: ctx.from?.username || '',
        }),
      });

      // Explicitly load YAML files from the locales directory
      await this.instance.loadLocalesDir(path.resolve(process.cwd(), 'locales'));
    }

    return this.instance;
  }

  /**
   * Get the i18n instance.
   * @returns I18n instance
   * @throws Error if not initialized
   */
  static getInstance(): I18n<BotContext> {
    if (!this.instance) {
      throw new Error('I18n service not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  /**
   * Update user's language preference.
   * @param ctx - Bot context
   * @param language - Language code
   */
  static updateUserLanguage(ctx: BotContext, language: string): void {
    if (ctx.session) {
      ctx.session.userLanguage = language;
    }
    // Apply the new language immediately
    ctx.i18n.renegotiateLocale();
  }

  /**
   * Get available languages.
   * @returns Array of supported language codes
   */
  static getSupportedLanguages(): string[] {
    return ['en', 'es', 'ru', 'de'];
  }

  /**
   * Get language display name.
   * @param languageCode - Language code
   * @returns Display name for the language
   */
  static getLanguageDisplayName(languageCode: string): string {
    const languageNames: Record<string, string> = {
      en: '🇺🇸 English',
      es: '🇪🇸 Spanish',
      ru: '🇷🇺 Russian',
      de: '🇩🇪 German',
    };

    return languageNames[languageCode] || '🇺🇸 English';
  }
}

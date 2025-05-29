/**
 * @category Services
 */
import { I18n } from '@grammyjs/i18n';
import path from 'path';

import { BotContext } from '@/types/telegram';

/**
 * Internationalization service using grammY's i18n plugin for multi-language support.
 *
 * Provides automated translation management with features including:
 * - YAML-based translation files for easy management
 * - Automatic locale detection from user's Telegram settings
 * - Session-based language persistence
 * - Dynamic language switching
 * - Global context variables for personalized messages
 *
 * Supports English, Spanish, Russian, and German languages with fallback
 * to English for unsupported locales.
 *
 * @example
 * ```typescript
 * // Initialize the service (typically done once at startup)
 * const i18n = await I18nService.initialize();
 *
 * // Use in bot middleware
 * bot.use(i18n.middleware());
 *
 * // In message handlers
 * await ctx.reply(ctx.t('welcome_message', { name: 'John' }));
 *
 * // Change user language
 * I18nService.updateUserLanguage(ctx, 'es');
 * ```
 */
export class I18nService {
  private static instance: I18n<BotContext>;

  /**
   * Initializes the i18n service with translation files and configuration.
   *
   * Sets up locale negotiation strategy, loads translation files from the
   * locales directory, and configures global context variables for
   * personalized messages.
   *
   * Locale negotiation priority:
   * 1. User's session language preference
   * 2. Telegram user's language_code
   * 3. Default to English
   *
   * @returns Promise resolving to configured I18n instance
   * @throws Error if translation files cannot be loaded
   *
   * @example
   * ```typescript
   * // Initialize during application startup
   * const i18n = await I18nService.initialize();
   * bot.use(i18n.middleware());
   * ```
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
   * Retrieves the singleton i18n instance.
   *
   * @returns The configured I18n instance
   * @throws Error if service hasn't been initialized
   *
   * @example
   * ```typescript
   * const i18n = I18nService.getInstance();
   * // Use i18n instance for manual translation operations
   * ```
   */
  static getInstance(): I18n<BotContext> {
    if (!this.instance) {
      throw new Error('I18n service not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  /**
   * Updates user's language preference and persists it in session.
   *
   * Changes the user's active language and immediately applies it to
   * the current context. The language preference is stored in the
   * user's session for future interactions.
   *
   * @param ctx - Telegram bot context
   * @param language - Language code (e.g., 'en', 'es', 'ru', 'de')
   *
   * @example
   * ```typescript
   * // User selects Spanish
   * I18nService.updateUserLanguage(ctx, 'es');
   *
   * // Future messages will be in Spanish
   * await ctx.reply(ctx.t('settings_updated')); // "Configuración actualizada"
   * ```
   */
  static updateUserLanguage(ctx: BotContext, language: string): void {
    if (ctx.session) {
      ctx.session.userLanguage = language;
    }
    // Apply the new language immediately
    ctx.i18n.renegotiateLocale();
  }

  /**
   * Retrieves list of supported language codes.
   *
   * @returns Array of ISO language codes supported by the bot
   *
   * @example
   * ```typescript
   * const languages = I18nService.getSupportedLanguages();
   * // ['en', 'es', 'ru', 'de']
   *
   * // Create language selection keyboard
   * const keyboard = new InlineKeyboard();
   * languages.forEach(lang => {
   *   const displayName = I18nService.getLanguageDisplayName(lang);
   *   keyboard.text(displayName, `set_language_${lang}`);
   * });
   * ```
   */
  static getSupportedLanguages(): string[] {
    return ['en', 'es', 'ru', 'de'];
  }

  /**
   * Converts language code to user-friendly display name with flag emoji.
   *
   * @param languageCode - ISO language code
   * @returns Formatted display name with country flag emoji
   *
   * @example
   * ```typescript
   * const displayName = I18nService.getLanguageDisplayName('es');
   * console.log(displayName); // "🇪🇸 Spanish"
   *
   * // Use in language selection interface
   * const languages = I18nService.getSupportedLanguages().map(code => ({
   *   code,
   *   name: I18nService.getLanguageDisplayName(code)
   * }));
   * ```
   */
  static getLanguageDisplayName(languageCode: string): string {
    const languageNames: Record<string, string> = {
      en: '🇺🇸 English',
      es: '🇪🇸 Spanish',
      ru: '🇷🇺 Russian',
      de: '🇩🇪 German',
    };

    return languageNames[languageCode] || '��🇸 English';
  }
}

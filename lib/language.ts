import de from './translations/de.json';
import en from './translations/en.json';
import ru from './translations/ru.json';
import uk from './translations/uk.json';
import { logger } from "@/lib/logger";

/**
 * Supported language codes for the application
 * - 'en': English
 * - 'de': German (Deutsch)
 * - 'ru': Russian (Русский)
 * - 'uk': Ukrainian (Українська)
 */
export type Language = 'de' | 'en' | 'ru' | 'uk';

type TranslationValue = string | Record<string, unknown>;

const translations: Record<Language, Record<string, unknown>> = { de, en, ru, uk };

/**
 * Retrieves the complete translation object for a given language
 *
 * Returns the full nested translation object containing all strings and keys for the specified language.
 * Falls back to English if an invalid language code is provided.
 *
 * @param {Language} language - The language code to retrieve translations for
 * @returns {Record<string, unknown>} Nested object containing all translations for the language
 *
 * @example
 * const enTranslations = getTranslations('en');
 * const deTranslations = getTranslations('de');
 *
 * @remarks
 * - Fallback: Always defaults to English if language not found
 * - Returns entire translation object, not individual strings
 * - For individual translations, use the `t()` function instead
 */
export function getTranslations(language: Language): Record<string, unknown> {
  return translations[language] || translations.en;
}

/**
 * Retrieves a translated string for a given key
 *
 * Navigates nested translation objects using dot-separated key paths.
 * Returns the key itself as fallback if translation is not found.
 *
 * Translation Key Format:
 * - Dot-separated path to nested value (e.g., "coach.clients", "messages.error.notFound")
 * - Traverses translation object level by level
 * - Supports any depth of nesting
 *
 * @param {Language} language - The language code to retrieve translation for
 * @param {string} key - Dot-separated translation key (e.g., "coach.clients", "buttons.submit")
 * @returns {string} Translated string or the key itself if translation not found
 *
 * @example
 * // Simple translations
 * t('en', 'coach.clients')      // Returns: "Clients"
 * t('de', 'coach.clients')      // Returns: "Klienten"
 *
 * // Nested translations
 * t('en', 'buttons.primary.submit')  // Returns: "Submit"
 * t('en', 'errors.auth.invalid')     // Returns: "Invalid credentials"
 *
 * // Fallback to key if not found
 * t('en', 'missing.translation.key') // Returns: "missing.translation.key"
 *
 * @remarks
 * - Development warning: Console warnings logged for missing translations in development mode
 * - Ensures final value is string: logs warning if nested value is not a string
 * - Used throughout UI with LanguageContext for consistent translations
 * - Fallback order: Requested language → Fallback to key itself (no exception thrown)
 */
export function t(language: Language, key: string): string {
  const keys = key.split('.');
  let current: TranslationValue = getTranslations(language);

  for (const k of keys) {
    if (typeof current === 'object' && current !== null && k in current) {
      current = (current as Record<string, unknown>)[k] as TranslationValue;
    } else {
      // Translation key not found - log in development
      if (process.env.NODE_ENV === 'development') {
        logger.warn(`Missing translation: ${language}.${key}`);
      }
      return key;
    }
  }

  // Ensure final value is a string
  if (typeof current !== 'string') {
    logger.warn(`Translation value is not a string: ${language}.${key}`);
    return key;
  }

  return current;
}

/**
 * Retrieves the user's preferred language from browser localStorage
 *
 * Loads the previously saved language preference from localStorage.
 * Validates that stored value is a supported language code.
 * Only runs in browser environment (returns default on server).
 *
 * @returns {Language} The stored language code, or 'en' (English) if not found or invalid
 *
 * @example
 * const userLanguage = getStoredLanguage();
 * // Returns: 'de' (if previously saved), otherwise 'en'
 *
 * @remarks
 * - Browser-only: Checks `typeof window !== 'undefined'` for SSR safety
 * - Validation: Only returns value if it matches supported languages (en, de, ru, uk)
 * - Default: Falls back to English ('en') if no preference stored or if browser unavailable
 * - localStorage key: 'language'
 * - Used during app initialization to restore user's language preference
 */
export function getStoredLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('language');
    if (stored === 'en' || stored === 'de' || stored === 'ru' || stored === 'uk') {
      return stored as Language;
    }
  }
  return 'en'; // Default to English
}

/**
 * Saves the user's language preference to browser localStorage
 *
 * Persists the selected language so it's restored on next visit.
 * Only writes to localStorage in browser environment (no-op on server).
 *
 * @param {Language} language - The language code to save as user preference
 *
 * @example
 * setStoredLanguage('de');  // Saves German preference
 * setStoredLanguage('ru');  // Saves Russian preference
 *
 * @remarks
 * - Browser-only: Checks `typeof window !== 'undefined'` for SSR safety
 * - Persistence: Saves to localStorage under key 'language'
 * - No validation: Caller is responsible for passing valid Language enum value
 * - Used when user changes language in settings/language selector
 * - Safe to call multiple times: subsequent calls overwrite previous preference
 */
export function setStoredLanguage(language: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', language);
  }
}

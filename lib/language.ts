import de from './translations/de.json';
import en from './translations/en.json';
import ru from './translations/ru.json';
import uk from './translations/uk.json';

export type Language = 'de' | 'en' | 'ru' | 'uk';

type TranslationValue = string | Record<string, unknown>;

const translations: Record<Language, Record<string, unknown>> = { de, en, ru, uk };

export function getTranslations(language: Language): Record<string, unknown> {
  return translations[language] || translations.en;
}

/**
 * Get translated string for a key
 * @param language - Language code
 * @param key - Dot-separated translation key (e.g., "coach.clients")
 * @returns Translated string or fallback to key if not found
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
        console.warn(`Missing translation: ${language}.${key}`);
      }
      return key;
    }
  }

  // Ensure final value is a string
  if (typeof current !== 'string') {
    console.warn(`Translation value is not a string: ${language}.${key}`);
    return key;
  }

  return current;
}

export function getStoredLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('language');
    if (stored === 'en' || stored === 'de' || stored === 'ru' || stored === 'uk') {
      return stored as Language;
    }
  }
  return 'en'; // Default to English
}

export function setStoredLanguage(language: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', language);
  }
}

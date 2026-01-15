import de from './translations/de.json';
import en from './translations/en.json';
import ru from './translations/ru.json';
import uk from './translations/uk.json';

export type Language = 'de' | 'en' | 'ru' | 'uk';

const translations = { de, en, ru, uk };

export function getTranslations(language: Language) {
  return translations[language] || translations.en;
}

export function t(language: Language, key: string): string {
  const keys = key.split('.');
  let current: any = getTranslations(language);

  for (const k of keys) {
    current = current?.[k];
  }

  return current || key;
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

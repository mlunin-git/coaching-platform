"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/lib/language";

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = "" }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();

  const defaultClassName =
    "px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer";

  return (
    <select
      value={language}
      onChange={(e) => {
        const value = e.target.value;
        if (["en", "de", "ru", "uk"].includes(value)) {
          setLanguage(value as Language);
        }
      }}
      className={className || defaultClassName}
    >
      <option value="en">🇬🇧 English</option>
      <option value="de">🇩🇪 Deutsch</option>
      <option value="ru">🇷🇺 Русский</option>
      <option value="uk">🇺🇦 Українська</option>
    </select>
  );
}

"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-600">
          <span>© {currentYear} Mike Lunin</span>

          <span className="hidden md:inline">•</span>

          <a
            href="https://github.com/mlunin-git/coaching-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 transition-colors font-medium"
          >
            Open Source on GitHub
          </a>

          <span className="hidden md:inline">•</span>

          <Link
            href="/privacy"
            className="hover:text-indigo-600 transition-colors"
          >
            {t("footer.privacy", "Privacy Policy")}
          </Link>

          <span className="hidden md:inline">•</span>

          <span className="text-xs text-gray-500">
            {t("footer.lastUpdated", "Last Updated")}: 2026-01-15
          </span>
        </div>
      </div>
    </footer>
  );
}

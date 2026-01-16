"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface User {
  name: string;
}

interface NavigationUserSectionProps {
  user: User | null;
  isMobile?: boolean;
  onLogout: () => void;
  onLinkClick?: () => void;
}

export function NavigationUserSection({
  user,
  isMobile = false,
  onLogout,
  onLinkClick,
}: NavigationUserSectionProps) {
  const { t } = useLanguage();

  if (isMobile) {
    return (
      <>
        {user ? (
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
            <span className="px-4 py-2 text-sm font-medium text-gray-900 bg-indigo-50 rounded-lg">
              {user.name}
            </span>
            <button
              onClick={() => {
                onLogout();
                onLinkClick?.();
              }}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              {t("common.logout")}
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            onClick={onLinkClick}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm text-center"
          >
            {t("auth.login")}
          </Link>
        )}
      </>
    );
  }

  // Desktop version
  return (
    <>
      {user ? (
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <span className="text-sm font-medium text-gray-900">{user.name}</span>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            {t("common.logout")}
          </button>
        </div>
      ) : (
        <Link
          href="/auth/login"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
        >
          {t("auth.login")}
        </Link>
      )}
    </>
  );
}

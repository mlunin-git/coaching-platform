"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface NavigationMenuItemsProps {
  user: { role: "coach" | "client" } | null;
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export function NavigationMenuItems({
  user,
  isMobile = false,
  onLinkClick,
}: NavigationMenuItemsProps) {
  const { t } = useLanguage();

  const linkClassName = isMobile
    ? "w-full px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors font-medium flex items-center gap-2"
    : "text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center gap-2";

  return (
    <>
      {/* Logged-in user menu */}
      {user ? (
        <>
          {user.role === "coach" && (
            <>
              <Link
                href="/coach/clients"
                onClick={onLinkClick}
                className={linkClassName}
              >
                👥 {t("coach.clients")}
              </Link>
              <Link
                href="/coach/messages"
                onClick={onLinkClick}
                className={linkClassName}
              >
                💬 {t("coach.messages")}
              </Link>
              <Link
                href="/coach/admin"
                onClick={onLinkClick}
                className={linkClassName}
              >
                🔧 {t("admin.title") || "Admin"}
              </Link>
            </>
          )}

          <Link
            href="/planning"
            onClick={onLinkClick}
            className={linkClassName}
          >
            📅 {t("planning.title")}
          </Link>

          <Link href="/apps" onClick={onLinkClick} className={linkClassName}>
            🛠️ {t("apps.title")}
          </Link>
        </>
      ) : (
        /* Anonymous user menu */
        <>
          <Link
            href="/planning"
            onClick={onLinkClick}
            className={linkClassName}
          >
            📅 {t("planning.title")}
          </Link>

          <Link href="/apps" onClick={onLinkClick} className={linkClassName}>
            🛠️ {t("apps.title")}
          </Link>
        </>
      )}
    </>
  );
}

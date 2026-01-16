"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";

interface User {
  id: string;
  email: string | null;
  name: string;
  role: "coach" | "client";
  auth_user_id: string | null;
  client_identifier: string | null;
  has_auth_access: boolean;
  created_at: string;
}

export function Navigation() {
  const { t, language, setLanguage } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          // Fetch user details
          const { data } = await supabase
            .from("users")
            .select("*")
            .eq("auth_user_id", authUser.id)
            .single();

          if (data) {
            setUser(data);
          }
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo / Branding */}
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 hover:text-gray-800 transition-colors"
          >
            Safe Space
          </Link>

          {/* Desktop Menu - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            {/* Logged-in user menu */}
            {user ? (
              <>
                {user.role === "coach" && (
                  <>
                    <Link
                      href="/coach/clients"
                      className="text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center gap-2"
                    >
                      👥 {t("coach.clients")}
                    </Link>
                    <Link
                      href="/coach/messages"
                      className="text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center gap-2"
                    >
                      💬 {t("coach.messages")}
                    </Link>
                  </>
                )}

                <Link
                  href="/planning"
                  className="text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center gap-2"
                >
                  📅 {t("planning.title")}
                </Link>

                <Link
                  href="/apps"
                  className="text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center gap-2"
                >
                  🛠️ {t("apps.title")}
                </Link>
              </>
            ) : (
              /* Anonymous user menu */
              <>
                <Link
                  href="/planning"
                  className="text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center gap-2"
                >
                  📅 {t("planning.title")}
                </Link>

                <Link
                  href="/apps"
                  className="text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center gap-2"
                >
                  🛠️ {t("apps.title")}
                </Link>
              </>
            )}

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="en">🇬🇧 English</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="ru">🇷🇺 Русский</option>
              <option value="uk">🇺🇦 Українська</option>
            </select>

            {/* User Profile / Login */}
            {user ? (
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <span className="text-sm font-medium text-gray-900">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
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
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-700 hover:text-indigo-600 transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Slide-out Drawer */}
              <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[80vw] bg-white shadow-2xl z-50 md:hidden overflow-y-auto">
                {/* Header with close button */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <span className="text-lg font-bold text-gray-900">
                    Safe Space
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-700 hover:text-indigo-600 transition-colors"
                    aria-label="Close menu"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Menu Items */}
                <nav className="flex flex-col p-4 space-y-2">
                  {/* Logged-in user menu */}
                  {user ? (
                    <>
                      {user.role === "coach" && (
                        <>
                          <Link
                            href="/coach/clients"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors font-medium flex items-center gap-2"
                          >
                            👥 {t("coach.clients")}
                          </Link>
                          <Link
                            href="/coach/messages"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors font-medium flex items-center gap-2"
                          >
                            💬 {t("coach.messages")}
                          </Link>
                        </>
                      )}

                      <Link
                        href="/planning"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors font-medium flex items-center gap-2"
                      >
                        📅 {t("planning.title")}
                      </Link>

                      <Link
                        href="/apps"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors font-medium flex items-center gap-2"
                      >
                        🛠️ {t("apps.title")}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/planning"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors font-medium flex items-center gap-2"
                      >
                        📅 {t("planning.title")}
                      </Link>

                      <Link
                        href="/apps"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors font-medium flex items-center gap-2"
                      >
                        🛠️ {t("apps.title")}
                      </Link>
                    </>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-2" />

                  {/* Language Selector */}
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="en">🇬🇧 English</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="ru">🇷🇺 Русский</option>
                    <option value="uk">🇺🇦 Українська</option>
                  </select>

                  {/* User Profile / Login */}
                  {user ? (
                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                      <span className="px-4 py-2 text-sm font-medium text-gray-900 bg-indigo-50 rounded-lg">
                        {user.name}
                      </span>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                      >
                        {t("common.logout")}
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm text-center"
                    >
                      {t("auth.login")}
                    </Link>
                  )}
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

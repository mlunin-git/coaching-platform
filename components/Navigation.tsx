"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseClient } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  name: string;
  role: "coach" | "client";
}

export function Navigation() {
  const { t, language, setLanguage } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

          {/* Main Menu */}
          <div className="flex items-center gap-6">
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
              onChange={(e) => setLanguage(e.target.value)}
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
        </div>
      </div>
    </nav>
  );
}

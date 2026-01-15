"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Database } from "@/lib/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];

function CoachLayoutContent({
  children,
  user,
  unreadCount,
}: {
  children: React.ReactNode;
  user: User;
  unreadCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();

  const navItems: Array<{ label: string; href: string; badge?: number }> = [
    { label: t("coach.clients"), href: "/coach/clients" },
    { label: `📨 ${t("coach.messages")}`, href: "/coach/messages", badge: unreadCount },
    { label: `📅 ${t("planning.title", "Year Planning")}`, href: "/planning/admin" },
    { label: `🛠️ ${t("apps.title")}`, href: "/apps" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-900">{t("coach.dashboard")}</h1>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-6">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={`${item.href}-${index}`}
                      href={item.href}
                      className={`text-sm font-medium transition-colors relative flex items-center gap-1 ${
                        item.badge && item.badge > 0 ? "pr-5" : ""
                      } ${
                        isActive
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {item.label}
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-2 -right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 border-l pl-6">
                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'de' | 'en')}
                    className="px-2 py-1 text-sm border border-gray-300 rounded hover:border-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>
                <span className="text-sm text-gray-600">{user.name}</span>
                <button
                  onClick={() => {
                    getSupabaseClient().auth.signOut();
                    router.push("/auth/login");
                  }}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  {t("common.logout")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const unreadCount = useUnreadMessages(user?.id || "", "coach");

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth/login");
        return;
      }

      supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .single()
        .then(({ data, error }) => {
          const userData = data as User | null;
          if (error || !userData || userData.role !== "coach") {
            router.push("/auth/login");
          } else {
            setUser(userData);
          }
          setLoading(false);
        });
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <CoachLayoutContent user={user} unreadCount={unreadCount}>
      {children}
    </CoachLayoutContent>
  );
}

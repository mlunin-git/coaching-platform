"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
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

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
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

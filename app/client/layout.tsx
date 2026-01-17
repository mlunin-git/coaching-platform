"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import type { Database } from "@/lib/database.types";
import { logger } from "@/lib/logger";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<Database["public"]["Tables"]["users"]["Row"] | null>(null);
  const [loading, setLoading] = useState(true);

  // Call hook early (even with empty ID, it's safe)
  const { unreadCount } = useUnreadMessages(user?.id || "", "client");

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth/login");
        return;
      }

      // Get user profile by auth_user_id
      supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .single()
        .then(({ data, error }) => {
          const userData = data as Database["public"]["Tables"]["users"]["Row"] | null;
          if (error || !userData || userData.role !== "client" || !userData.has_auth_access) {
            logger.error("Client layout auth error:", error);
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
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}

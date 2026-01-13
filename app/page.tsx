"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient();

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Get user role from database
        const { data } = await (supabase as any)
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (data?.role === "coach") {
          router.push("/coach/clients");
        } else if (data?.role === "client") {
          router.push("/client/tasks");
        }
      } else {
        router.push("/auth/login");
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return null;
}

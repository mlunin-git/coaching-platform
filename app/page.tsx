"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Get user role from database
        (supabase as any)
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data }: any) => {
            if (data?.role === "coach") {
              router.push("/coach/clients");
            } else if (data?.role === "client") {
              router.push("/client/tasks");
            }
          });
      } else {
        router.push("/auth/login");
      }
      setLoading(false);
    });
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

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

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        router.push("/apps");
        setLoading(false);
        return;
      }

      if (session?.user?.id) {
        // Get user role from database
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("auth_user_id", session.user.id)
          .single()
          .timeout(5000);

        if (error) {
          console.error("User lookup error:", error);
          router.push("/apps");
        } else if (data?.role === "coach") {
          router.push("/coach/clients");
        } else if (data?.role === "client") {
          router.push("/client/tasks");
        } else {
          router.push("/apps");
        }
      } else {
        router.push("/apps");
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

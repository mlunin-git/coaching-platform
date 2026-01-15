import { redirect } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = getSupabaseClient();

  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Get user data to check role
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("auth_user_id", session.user.id)
    .single();

  if (userError || !userData || userData.role !== "coach") {
    redirect("/auth/login");
  }

  return <>{children}</>;
}

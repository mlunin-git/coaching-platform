import { getSupabaseClient } from "./supabase";

export async function signUp(email: string, password: string, name: string, role: "coach" | "client") {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Insert user profile
  const { error: profileError } = await supabase.from("users").insert({
    id: data.user?.id,
    email,
    name,
    role,
  });

  if (profileError) throw profileError;

  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  return user;
}

export async function getUserProfile(userId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();

  if (error) throw error;

  return data;
}

import { getSupabaseClient } from "./supabase";
import { logger } from "./logger";
import type { Database } from "./database.types";

type User = Database["public"]["Tables"]["users"]["Row"];

/**
 * Sign up with rate limiting via API route
 * Recommended for public signup endpoints
 *
 * @param email - User email
 * @param password - User password
 * @param name - User name
 * @param role - User role (coach or client)
 * @returns Auth data with user info
 *
 * @throws Error if signup fails or rate limited
 */
export async function signUpRateLimited(
  email: string,
  password: string,
  name: string,
  role: "coach" | "client"
) {
  try {
    // Fetch CSRF token first
    const csrfResponse = await fetch("/api/auth/csrf-token", {
      method: "GET",
      credentials: "include",
    });

    const csrfData = (await csrfResponse.json()) as Record<string, unknown>;
    const csrfToken = csrfData.token as string;

    if (!csrfToken) {
      throw new Error("Failed to obtain CSRF token");
    }

    // Now submit signup with CSRF token
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({ email, password, name, role }),
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      throw new Error(
        (data.error as string) || "Signup failed"
      );
    }

    return data;
  } catch (error) {
    logger.error("Signup error", error);
    throw error;
  }
}

/**
 * Sign up without rate limiting (direct Supabase)
 * Use signUpRateLimited() instead for public endpoints
 *
 * @deprecated Use signUpRateLimited() instead
 */
export async function signUp(email: string, password: string, name: string, role: "coach" | "client") {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Insert user profile with auth_user_id reference
  const { error: profileError } = await supabase
    .from("users")
    .insert({
      auth_user_id: data.user?.id,
      email,
      name,
      role,
      has_auth_access: true,
      client_identifier: null,
    });

  if (profileError) throw profileError;

  return data;
}

/**
 * Sign in with rate limiting via API route
 * Recommended for public login endpoints
 *
 * @param email - User email
 * @param password - User password
 * @returns Session and user data
 *
 * @throws Error if login fails or rate limited
 *
 * @example
 * try {
 *   const { session, user } = await signInRateLimited(email, password);
 * } catch (error) {
 *   if (error.message.includes("Too many")) {
 *     // Handle rate limiting
 *   }
 * }
 */
export async function signInRateLimited(email: string, password: string) {
  try {
    // Fetch CSRF token first
    const csrfResponse = await fetch("/api/auth/csrf-token", {
      method: "GET",
      credentials: "include",
    });

    const csrfData = (await csrfResponse.json()) as Record<string, unknown>;
    const csrfToken = csrfData.token as string;

    if (!csrfToken) {
      throw new Error("Failed to obtain CSRF token");
    }

    // Now submit login with CSRF token
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      throw new Error(
        (data.error as string) || "Login failed"
      );
    }

    // Set the session on the Supabase client
    const session = data.session as Record<string, unknown> | undefined;
    if (session) {
      const supabase = getSupabaseClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: session.access_token as string,
        refresh_token: session.refresh_token as string,
      });

      if (sessionError) {
        logger.error("Failed to set session", sessionError);
        throw new Error("Failed to establish session");
      }
    }

    return data;
  } catch (error) {
    logger.error("Login error", error);
    throw error;
  }
}

/**
 * Sign in without rate limiting (direct Supabase)
 * Use signInRateLimited() instead for public endpoints
 *
 * @deprecated Use signInRateLimited() instead
 */
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

export async function getUserProfile(userId: string): Promise<User> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();

  if (error) throw error;

  return data as User;
}

export async function getUserByAuthId(authUserId: string): Promise<User> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", authUserId)
    .single();

  if (error) throw error;

  return data as User;
}

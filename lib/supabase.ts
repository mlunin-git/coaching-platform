import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Use a global variable to store the singleton instance across module reloads
declare global {
  var supabaseClientInstance: ReturnType<typeof createClient<Database>> | undefined;
}

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  // Reuse existing instance if available
  if (global.supabaseClientInstance) {
    return global.supabaseClientInstance;
  }

  // Create and store the client
  global.supabaseClientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return global.supabaseClientInstance;
}

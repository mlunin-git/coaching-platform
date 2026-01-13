import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Generates a unique client identifier for non-email clients.
 * Format: coach{4_chars}_client{3_digits}
 * Example: coach7a2x_client001
 *
 * @param coachId - The UUID of the coach
 * @param supabaseClient - The Supabase client instance
 * @returns A unique client identifier string
 */
export async function generateClientIdentifier(
  coachId: string,
  supabaseClient: SupabaseClient
): Promise<string> {
  // Get short coach ID (first 4 chars for readability)
  const shortCoachId = coachId.substring(0, 4);

  // Find the highest sequence number for this coach
  const { data: existingClients, error } = await supabaseClient
    .from("users")
    .select("client_identifier")
    .not("client_identifier", "is", null)
    .like("client_identifier", `coach${shortCoachId}_client%`)
    .order("client_identifier", { ascending: false })
    .limit(1);

  if (error) throw error;

  let nextSequence = 1;

  if (existingClients && existingClients.length > 0) {
    // Extract sequence number from last identifier
    const lastIdentifier = existingClients[0].client_identifier;
    const match = lastIdentifier.match(/client(\d+)$/);
    if (match) {
      nextSequence = parseInt(match[1], 10) + 1;
    }
  }

  // Format: coach7a2x_client001
  const sequence = nextSequence.toString().padStart(3, "0");
  return `coach${shortCoachId}_client${sequence}`;
}

/**
 * Validates a client identifier format
 * @param identifier - The client identifier to validate
 * @returns true if the identifier matches the expected format
 */
export function isValidClientIdentifier(identifier: string): boolean {
  return /^coach[a-z0-9]{4}_client\d{3}$/.test(identifier);
}

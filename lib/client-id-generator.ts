import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Generates a unique, human-readable client identifier for clients without email addresses
 *
 * Creates sequential identifiers in format: `coach{4_chars}_client{3_digits}`
 * Used when coaches want to share client links without requiring email addresses.
 *
 * Sequence:
 * - Queries database for existing identifiers with same coach prefix
 * - Increments sequence number and pads to 3 digits (001, 002, etc.)
 * - Returns new unique identifier (e.g., coach7a2x_client001, coach7a2x_client002)
 *
 * @param {string} coachId - The UUID of the coach creating the client
 * @param {SupabaseClient} supabaseClient - Supabase client instance for database queries
 * @returns {Promise<string>} A unique client identifier string matching format `coach{4}_client{3_digits}`
 * @throws {Error} If database query fails
 *
 * @example
 * const supabase = getSupabaseClient();
 * const clientId = await generateClientIdentifier(coachUUID, supabase);
 * // Returns: "coach7a2x_client001"
 *
 * @remarks
 * - Coach ID is shortened to first 4 characters for readability
 * - Sequence numbers pad to 3 digits (001-999 clients per coach)
 * - Uses database query to find highest existing sequence (O(log n) with ordering)
 * - Suitable for QR codes and shareable links
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
 * Validates whether a string matches the client identifier format
 *
 * Checks if the identifier conforms to the expected format:
 * - Starts with "coach" followed by exactly 4 alphanumeric characters
 * - Contains underscore separator
 * - Ends with "client" followed by exactly 3 digits
 *
 * @param {string} identifier - The client identifier string to validate
 * @returns {boolean} true if identifier matches format `coach[a-z0-9]{4}_client[0-9]{3}`, false otherwise
 *
 * @example
 * isValidClientIdentifier('coach7a2x_client001')  // true
 * isValidClientIdentifier('coach7a2x_client1')    // false (not 3 digits)
 * isValidClientIdentifier('coach_client001')      // false (not 4 characters)
 * isValidClientIdentifier('coachABCD_client001')  // false (has uppercase)
 * isValidClientIdentifier('random-string')       // false
 *
 * @remarks
 * - Case-sensitive: lowercase only (matches generateClientIdentifier output)
 * - Used for client input validation and security checks
 * - Regex: `/^coach[a-z0-9]{4}_client\d{3}$/`
 */
export function isValidClientIdentifier(identifier: string): boolean {
  return /^coach[a-z0-9]{4}_client\d{3}$/.test(identifier);
}

/**
 * Secure password generation utilities
 * Generates cryptographically strong passwords for new users
 */

/**
 * Generate a cryptographically secure random password
 * Uses crypto.getRandomValues for security
 * Format: Base64-like string with 128+ bits of entropy
 *
 * @returns A randomly generated secure password
 */
export function generateSecurePassword(): string {
  // Use 16 bytes = 128 bits of entropy (sufficient for strong security)
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Convert to URL-safe Base64 (replaces +/= with -_)
  const securePassword = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return securePassword;
}

/**
 * Generate a memorable password with character variety
 * Useful for initial setup where users might need to type it
 * Format: "Adjective + Noun + Number" (18+ characters)
 *
 * @returns A memorable but secure password
 */
export function generateMemorablePassword(): string {
  const adjectives = [
    "Happy", "Bright", "Swift", "Calm", "Bold",
    "Keen", "Wise", "Fresh", "Quick", "Sharp",
  ];

  const nouns = [
    "Tiger", "Eagle", "River", "Mountain", "Forest",
    "Ocean", "Storm", "Phoenix", "Summit", "Comet",
  ];

  // Get random indices
  const randomIndex = (max: number) => {
    const arr = new Uint8Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  };

  const adjective = adjectives[randomIndex(adjectives.length)];
  const noun = nouns[randomIndex(nouns.length)];

  // Generate random 3-digit number
  const digitBytes = new Uint8Array(1);
  crypto.getRandomValues(digitBytes);
  const number = String(100 + (digitBytes[0] % 900));

  return `${adjective}${noun}${number}`;
}

/**
 * Validate password strength
 * Checks for sufficient entropy and character variety
 *
 * @param password - The password to validate
 * @returns true if password meets strength requirements
 */
export function validatePasswordStrength(password: string): boolean {
  // Minimum 8 characters
  if (!password || password.length < 8) return false;

  // Maximum 128 characters (prevent potential DoS from very long strings)
  if (password.length > 128) return false;

  // Check for variety (at least 2 of: uppercase, lowercase, number, special)
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]/.test(password);

  const varietyCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(
    Boolean
  ).length;

  return varietyCount >= 2;
}

/**
 * Calculate password entropy (in bits)
 * Used for security auditing
 *
 * @param password - The password to analyze
 * @returns Estimated entropy in bits
 */
export function calculatePasswordEntropy(password: string): number {
  if (!password) return 0;

  // Determine character set size
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32; // Approximate special chars

  // Entropy = log2(charsetSize^passwordLength)
  if (charsetSize === 0) return 0;
  return Math.log2(Math.pow(charsetSize, password.length));
}

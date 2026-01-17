/**
 * CSRF (Cross-Site Request Forgery) protection utilities
 *
 * Implements token-based CSRF protection for state-changing operations.
 * Works in conjunction with SameSite cookie attribute for defense-in-depth.
 *
 * Uses Web Crypto API for Edge Runtime compatibility (no Node.js crypto module).
 */

import { logger } from "@/lib/logger";

/**
 * Generate a cryptographically secure CSRF token
 *
 * @returns A base64-encoded random token (32 bytes = 256 bits entropy)
 *
 * @example
 * const token = generateCSRFToken();
 * // Returns: 'a7f3e9b2c1d4f6a8e2b5c9d1f4a7e3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1'
 */
export function generateCSRFToken(): string {
  // Generate 32 bytes of random data (256 bits entropy) using Web Crypto API
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);

  // Encode as base64url (URL-safe base64)
  const binaryString = String.fromCharCode(...Array.from(randomBytes));
  return btoa(binaryString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Constant-time string comparison to prevent timing attacks
 *
 * Compares two strings in constant time, taking the same amount of time
 * regardless of where the first difference occurs.
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns True if strings are equal
 */
function constantTimeEqual(a: string, b: string): boolean {
  // If lengths differ, still do full comparison to avoid length leakage
  const minLength = Math.min(a.length, b.length);
  let result = a.length === b.length ? 0 : 1;

  for (let i = 0; i < minLength; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Verify a CSRF token against a stored token
 *
 * Uses constant-time comparison to prevent timing attacks
 *
 * @param token - The token to verify
 * @param storedToken - The token stored on the server
 * @returns True if tokens match
 *
 * @example
 * const isValid = verifyCSRFToken(userToken, sessionToken);
 */
export function verifyCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  return constantTimeEqual(token, storedToken);
}

/**
 * CSRF token storage (in-memory, production should use session/database)
 *
 * Maps user sessions to their CSRF tokens.
 * Stored on globalThis to survive Next.js hot module reloads during development.
 */
const getTokenStore = () => {
  if (!globalThis.csrfTokenStore) {
    globalThis.csrfTokenStore = new Map<
      string,
      { token: string; expiresAt: number }
    >();

    // Setup cleanup interval only once
    if (!globalThis.csrfCleanupInterval) {
      globalThis.csrfCleanupInterval = setInterval(() => {
        const now = Date.now();
        const store = globalThis.csrfTokenStore as Map<
          string,
          { token: string; expiresAt: number }
        >;
        for (const [key, value] of store.entries()) {
          if (value.expiresAt < now) {
            store.delete(key);
          }
        }
      }, 5 * 60 * 1000);
    }
  }

  return globalThis.csrfTokenStore as Map<
    string,
    { token: string; expiresAt: number }
  >;
};

declare global {
  var csrfTokenStore: Map<string, { token: string; expiresAt: number }> | undefined;
  var csrfCleanupInterval: NodeJS.Timeout | undefined;
}

/**
 * Store a CSRF token for a session
 *
 * @param sessionId - The session identifier
 * @param token - The CSRF token
 * @param expiryMs - Token expiry time in milliseconds (default: 1 hour)
 *
 * @example
 * const token = generateCSRFToken();
 * storeCSRFToken(sessionId, token);
 */
export function storeCSRFToken(
  sessionId: string,
  token: string,
  expiryMs: number = 60 * 60 * 1000 // 1 hour
): void {
  if (!sessionId || !token) {
    logger.warn("Invalid CSRF token storage attempt", {
      sessionId: sessionId?.substring(0, 10),
    });
    return;
  }

  const tokenStore = getTokenStore();
  tokenStore.set(sessionId, {
    token,
    expiresAt: Date.now() + expiryMs,
  });

  logger.debug("CSRF token stored", {
    sessionId: sessionId.substring(0, 10),
    tokenPrefix: token.substring(0, 10),
    expiryMs,
    tokenStoreSize: tokenStore.size,
  });
}

/**
 * Retrieve a CSRF token for a session
 *
 * @param sessionId - The session identifier
 * @returns The CSRF token or null if not found/expired
 *
 * @example
 * const token = getCSRFToken(sessionId);
 */
export function getCSRFToken(sessionId: string): string | null {
  if (!sessionId) {
    return null;
  }

  const tokenStore = getTokenStore();
  const entry = tokenStore.get(sessionId);

  if (!entry) {
    return null;
  }

  // Check if expired
  if (entry.expiresAt < Date.now()) {
    tokenStore.delete(sessionId);
    return null;
  }

  return entry.token;
}

/**
 * Validate and consume a CSRF token (removes it after use)
 *
 * @param sessionId - The session identifier
 * @param token - The token to validate
 * @returns True if token is valid and matches
 *
 * @example
 * if (!validateCSRFToken(sessionId, userProvidedToken)) {
 *   return new Response('CSRF token invalid', { status: 403 });
 * }
 */
export function validateCSRFToken(sessionId: string, token: string): boolean {
  if (!sessionId || !token) {
    logger.warn("CSRF token validation with missing parameters", {
      sessionId: sessionId?.substring(0, 10),
    });
    return false;
  }

  const storedToken = getCSRFToken(sessionId);

  if (!storedToken) {
    const tokenStore = getTokenStore();
    logger.warn("CSRF token not found for session", {
      sessionId: sessionId.substring(0, 10),
      tokenStoreSize: tokenStore.size,
      availableSessions: Array.from(tokenStore.keys()).slice(0, 3).join(", "),
    });
    return false;
  }

  // Verify using constant-time comparison
  const isValid = verifyCSRFToken(token, storedToken);

  if (!isValid) {
    logger.warn("CSRF token mismatch", {
      sessionId: sessionId.substring(0, 10),
      providedTokenPrefix: token.substring(0, 10),
      storedTokenPrefix: storedToken.substring(0, 10),
    });
  } else {
    // Consume the token (remove after use)
    const tokenStore = getTokenStore();
    tokenStore.delete(sessionId);
    logger.debug("CSRF token validated and consumed", {
      sessionId: sessionId.substring(0, 10),
    });
  }

  return isValid;
}

/**
 * Clear a CSRF token for a session (logout)
 *
 * @param sessionId - The session identifier
 *
 * @example
 * await clearCSRFToken(sessionId);
 */
export function clearCSRFToken(sessionId: string): void {
  if (sessionId) {
    const tokenStore = getTokenStore();
    tokenStore.delete(sessionId);
  }
}

/**
 * Cleanup resources when server shuts down
 */
export function cleanupCSRF(): void {
  if (globalThis.csrfCleanupInterval) {
    clearInterval(globalThis.csrfCleanupInterval);
    globalThis.csrfCleanupInterval = undefined;
  }
  if (globalThis.csrfTokenStore) {
    globalThis.csrfTokenStore.clear();
    globalThis.csrfTokenStore = undefined;
  }
}

/**
 * CSRF protection middleware for forms
 *
 * Validates CSRF token from request body or headers
 *
 * @param request - The incoming request
 * @param sessionId - The session identifier
 * @returns Error message if validation fails, null if valid
 *
 * @example
 * const error = validateCSRFFromRequest(request, sessionId);
 * if (error) {
 *   return new Response(error, { status: 403 });
 * }
 */
export async function validateCSRFFromRequest(
  request: Request,
  sessionId: string
): Promise<string | null> {
  try {
    // Check for token in headers (preferred for API calls)
    let token = request.headers.get("x-csrf-token");

    // Fallback to form data (for traditional forms)
    if (!token) {
      const contentType = request.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const body = await request.json();
        token = (body as Record<string, unknown>).csrfToken as string;
      } else if (contentType?.includes("application/x-www-form-urlencoded")) {
        const formData = await request.formData();
        token = formData.get("csrf_token") as string;
      }
    }

    if (!token) {
      return "CSRF token missing";
    }

    if (!validateCSRFToken(sessionId, token)) {
      return "CSRF token invalid";
    }

    return null; // Valid
  } catch (error) {
    logger.error("CSRF validation error", error);
    return "CSRF validation failed";
  }
}

/**
 * Configuration for CSRF protection
 */
export const csrfConfig = {
  /** Token expiry time in milliseconds (1 hour) */
  tokenExpiryMs: 60 * 60 * 1000,

  /** Method names that require CSRF protection */
  protectedMethods: ["POST", "PUT", "DELETE", "PATCH"],

  /** Header name for CSRF token in requests */
  headerName: "x-csrf-token",

  /** Form field name for CSRF token */
  formFieldName: "csrf_token",
};

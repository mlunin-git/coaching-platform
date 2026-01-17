/**
 * API route for retrieving CSRF tokens
 *
 * GET /api/auth/csrf-token
 *
 * Returns the CSRF token for the current session
 */

import { NextRequest, NextResponse } from "next/server";
import { getClientIP } from "@/lib/rate-limiter";
import { generateCSRFToken, storeCSRFToken, getCSRFToken } from "@/lib/csrf";
import { logger } from "@/lib/logger";

/**
 * CSRF token retrieval handler
 *
 * Returns the CSRF token for the client to use in subsequent requests
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get client IP to create session ID (same as middleware)
    let ip = getClientIP(request);

    // On localhost/development, use a fallback
    if (!ip || ip === "unknown" || ip === "::") {
      // Use a fixed session ID for development, or use browser user agent
      const userAgent = request.headers.get("user-agent") || "unknown";
      ip = `dev-${userAgent.substring(0, 20)}`;
    }

    const sessionId = `session-${ip}`;

    // Check if token already exists for this session
    let token = getCSRFToken(sessionId);

    // If no token exists, generate a new one
    if (!token) {
      token = generateCSRFToken();
      storeCSRFToken(sessionId, token);
    }

    // Return token in response
    const response = NextResponse.json(
      {
        token,
      },
      { status: 200 }
    );

    // Set session cookie for CSRF tracking (no Secure flag for localhost/development)
    const isProduction = process.env.NODE_ENV === "production";
    const secureFlag = isProduction ? "; Secure" : "";
    response.headers.set(
      "Set-Cookie",
      `csrf-session=${sessionId}; Path=/; HttpOnly${secureFlag}; SameSite=Strict`
    );

    return response;
  } catch (error) {
    logger.error("CSRF token endpoint error", error);

    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}

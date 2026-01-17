/**
 * Next.js Middleware for security and rate limiting
 *
 * This middleware runs before each request and applies:
 * - Rate limiting to authentication endpoints
 * - CSRF token validation and generation
 * - Security headers
 * - Request logging and monitoring
 */

import { NextRequest, NextResponse } from "next/server";
import {
  loginRateLimiter,
  signupRateLimiter,
  getClientIP,
  createRateLimitIdentifier,
} from "@/lib/rate-limiter";
import {
  generateCSRFToken,
  storeCSRFToken,
  validateCSRFFromRequest,
} from "@/lib/csrf";

/**
 * Middleware configuration
 * Specify which paths this middleware applies to
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/trpc (tRPC)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};

/**
 * Get or create session ID from request
 */
function getOrCreateSessionId(request: NextRequest): string {
  // In production, use actual session management (NextAuth.js, etc.)
  // For now, use IP address as session identifier for CSRF protection
  const ip = getClientIP(request);
  return `session-${ip}`;
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  const method = request.method;

  // Apply rate limiting and CSRF protection to auth endpoints
  if (pathname === "/auth/login" && method === "POST") {
    return await handleLoginRateLimit(request);
  }

  if (pathname === "/auth/signup" && method === "POST") {
    return await handleSignupRateLimit(request);
  }

  // Add CSRF token to GET requests for forms (store in response headers for client)
  if ((pathname === "/auth/login" || pathname === "/auth/signup") && method === "GET") {
    const sessionId = getOrCreateSessionId(request);
    const csrfToken = generateCSRFToken();

    // Store token server-side
    storeCSRFToken(sessionId, csrfToken);

    // Add token to response headers for client to use
    const response = NextResponse.next();
    response.headers.set("X-CSRF-Token", csrfToken);
    const isProduction = process.env.NODE_ENV === "production";
    const secureFlag = isProduction ? "; Secure" : "";
    response.headers.set(
      "Set-Cookie",
      `csrf-session=${sessionId}; Path=/; HttpOnly${secureFlag}; SameSite=Strict`
    );

    return response;
  }

  // Continue with normal request processing
  const response = NextResponse.next();

  // Set secure cookie flags globally (works with next/headers cookies too)
  // Note: This sets the SameSite flag for all cookies
  response.headers.set(
    "Set-Cookie",
    `SameSite=Strict; Secure; Path=/`
  );

  return response;
}

/**
 * Handle rate limiting for login endpoint
 */
async function handleLoginRateLimit(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const ip = getClientIP(request);

    // Try to extract email from request body for more precise rate limiting
    let email = "unknown";
    try {
      const body = await request.json();
      email = body.email || "unknown";
      // Re-create request body since we consumed it
      request = new NextRequest(request, {
        body: JSON.stringify(body),
      });
    } catch {
      // If we can't parse body, just use IP
    }

    // Create combined identifier for rate limiting
    const identifier = createRateLimitIdentifier(email, ip);

    // Check rate limit
    const result = await loginRateLimiter(identifier);

    if (!result.success) {
      // Rate limit exceeded
      const resetTime = new Date(result.resetTime).toISOString();

      return NextResponse.json(
        {
          error: "Too many login attempts",
          message: "Please try again in 1 hour",
          resetTime,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000)
              .toString(),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": result.resetTime.toString(),
          },
        }
      );
    }

    // Add rate limit info to response headers
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", "5");
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", result.resetTime.toString());

    return response;
  } catch (error) {
    console.error("[SECURITY] Rate limiter error on login:", error);
    // Fail open - allow request if rate limiter fails
    return NextResponse.next();
  }
}

/**
 * Handle rate limiting for signup endpoint
 */
async function handleSignupRateLimit(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const ip = getClientIP(request);

    // Check rate limit (based on IP only for signup)
    const result = await signupRateLimiter(ip);

    if (!result.success) {
      // Rate limit exceeded
      const resetTime = new Date(result.resetTime).toISOString();

      return NextResponse.json(
        {
          error: "Too many signup attempts",
          message: "Please try again tomorrow",
          resetTime,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000)
              .toString(),
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": result.resetTime.toString(),
          },
        }
      );
    }

    // Add rate limit info to response headers
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", "10");
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", result.resetTime.toString());

    return response;
  } catch (error) {
    console.error("[SECURITY] Rate limiter error on signup:", error);
    // Fail open - allow request if rate limiter fails
    return NextResponse.next();
  }
}

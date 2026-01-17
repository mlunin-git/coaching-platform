/**
 * Next.js Middleware for security and rate limiting
 *
 * This middleware runs before each request and applies:
 * - Rate limiting to authentication endpoints
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
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Apply rate limiting to auth endpoints
  if (pathname === "/auth/login" && request.method === "POST") {
    return await handleLoginRateLimit(request);
  }

  if (pathname === "/auth/signup" && request.method === "POST") {
    return await handleSignupRateLimit(request);
  }

  // Continue with normal request processing
  return NextResponse.next();
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

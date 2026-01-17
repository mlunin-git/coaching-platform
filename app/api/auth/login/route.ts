/**
 * API route for user login with rate limiting
 *
 * POST /api/auth/login
 *
 * Request body:
 * {
 *   email: string;
 *   password: string;
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { loginRateLimiter, getClientIP, createRateLimitIdentifier } from "@/lib/rate-limiter";
import { validateCSRFFromRequest, clearCSRFToken } from "@/lib/csrf";
import { logger } from "@/lib/logger";

/**
 * Login handler with rate limiting
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract request body
    const body = await request.json();
    const { email, password } = body as Record<string, unknown>;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Get client IP
    let ip = getClientIP(request);

    // On localhost/development, use a fallback
    if (!ip || ip === "unknown" || ip === "::") {
      // Use browser user agent for consistent session ID
      const userAgent = request.headers.get("user-agent") || "unknown";
      ip = `dev-${userAgent.substring(0, 20)}`;
    }

    // Create rate limit identifier (email + IP)
    const identifier = createRateLimitIdentifier(email, ip);

    // CSRF validation - read session ID from cookie instead of recreating it
    let csrfSessionId = request.cookies.get("csrf-session")?.value;
    const hasCookie = !!csrfSessionId;

    if (!csrfSessionId) {
      // Fallback to recreating session ID if cookie not present
      csrfSessionId = `session-${ip}`;
    }

    logger.debug("CSRF validation attempt", {
      hasCookie,
      csrfSessionId: csrfSessionId.substring(0, 20),
      ip: ip.substring(0, 20),
    });

    const csrfError = await validateCSRFFromRequest(request, csrfSessionId);
    if (csrfError) {
      logger.warn("CSRF validation failed on login", {
        error: csrfError,
        csrfSessionId: csrfSessionId.substring(0, 20),
        hasCookie,
      });
      return NextResponse.json(
        { error: "CSRF validation failed" },
        { status: 403 }
      );
    }

    // Check rate limit
    const rateLimitResult = await loginRateLimiter(identifier);

    if (!rateLimitResult.success) {
      logger.warn("Login rate limit exceeded", {
        email: email.substring(0, 5), // Partial email for logging
        ip: ip.substring(0, 10), // Partial IP for logging
      });

      return NextResponse.json(
        {
          error: "Too many login attempts",
          message: "Please try again in 1 hour",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
              .toString(),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    // Import Supabase client dynamically to avoid circular dependencies
    const { getSupabaseClient } = await import("@/lib/supabase");
    const { getUserByAuthId } = await import("@/lib/auth");

    const supabase = getSupabaseClient();

    // Attempt login with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      logger.warn("Login attempt failed", {
        email: email.substring(0, 5),
        reason: error?.message || "Unknown",
      });

      // Don't reveal if email exists or password is wrong (security)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const profile = await getUserByAuthId(data.user.id);

    if (!profile) {
      logger.warn("User profile not found after login", {
        userId: data.user.id,
      });

      return NextResponse.json(
        { error: "User profile not found" },
        { status: 400 }
      );
    }

    // Log successful login
    logger.info("User logged in successfully", {
      email: email.substring(0, 5),
      role: profile.role,
    });

    // Return success with user data
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile.role,
        },
        session: data.session,
      },
      { status: 200 }
    );

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", "5");
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimitResult.resetTime.toString());

    return response;
  } catch (error) {
    logger.error("Login endpoint error", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * API route for user signup with rate limiting
 *
 * POST /api/auth/signup
 *
 * Request body:
 * {
 *   email: string;
 *   password: string;
 *   name: string;
 *   role: 'coach' | 'client';
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { signupRateLimiter, getClientIP } from "@/lib/rate-limiter";
import { logger } from "@/lib/logger";

/**
 * Signup handler with rate limiting
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract request body
    const body = await request.json();
    const { email, password, name, role } = body as Record<string, unknown>;

    // Validate inputs
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Email, password, name, and role are required" },
        { status: 400 }
      );
    }

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof name !== "string" ||
      typeof role !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["coach", "client"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'coach' or 'client'" },
        { status: 400 }
      );
    }

    // Type-cast role after validation
    const validatedRole = role as "coach" | "client";

    // Get client IP (rate limit by IP for signup)
    let ip = getClientIP(request);

    // On localhost/development, use a fallback
    if (!ip || ip === "unknown" || ip === "::") {
      // Use browser user agent for consistent session ID
      const userAgent = request.headers.get("user-agent") || "unknown";
      ip = `dev-${userAgent.substring(0, 20)}`;
    }

    // Check rate limit
    const rateLimitResult = await signupRateLimiter(ip);

    if (!rateLimitResult.success) {
      logger.warn("Signup rate limit exceeded", {
        ip: ip.substring(0, 10),
      });

      return NextResponse.json(
        {
          error: "Too many signup attempts",
          message: "Please try again tomorrow",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
              .toString(),
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    // Import Supabase client dynamically to avoid circular dependencies
    const { getSupabaseClient } = await import("@/lib/supabase");

    const supabase = getSupabaseClient();

    // Create user account with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      logger.warn("Signup attempt failed", {
        email: email.substring(0, 5),
        reason: error?.message || "Unknown",
      });

      // Check for specific errors
      if (error?.message.includes("already registered")) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }

      if (error?.message.includes("valid email")) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }

      // Generic error
      return NextResponse.json(
        { error: "Signup failed. Please try again." },
        { status: 400 }
      );
    }

    // Create user profile in database
    try {
      // Type assertion needed due to Supabase generic type complexity
      const { error: profileError } = await (supabase
        .from("users")
        .insert({
          auth_user_id: data.user.id,
          email: data.user.email,
          name,
          role: validatedRole,
          has_auth_access: true,
          client_identifier: null,
        }) as any);

      if (profileError) {
        logger.error("Failed to create user profile", {
          userId: data.user.id,
          error: profileError,
        });

        // Delete the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(data.user.id);

        return NextResponse.json(
          { error: "Failed to create user profile" },
          { status: 500 }
        );
      }
    } catch (error) {
      logger.error("Error creating user profile", error);

      // Attempt to clean up the auth user
      try {
        await supabase.auth.admin.deleteUser(data.user.id);
      } catch (cleanupError) {
        logger.error("Error cleaning up auth user", cleanupError);
      }

      return NextResponse.json(
        { error: "Failed to complete signup" },
        { status: 500 }
      );
    }

    // Log successful signup
    logger.info("User signed up successfully", {
      email: email.substring(0, 5),
      role,
    });

    // Return success
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name,
          role,
        },
      },
      { status: 201 }
    );

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", "10");
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimitResult.resetTime.toString());

    return response;
  } catch (error) {
    logger.error("Signup endpoint error", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

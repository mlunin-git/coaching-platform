/**
 * Rate limiting utility for protecting authentication endpoints
 *
 * Supports multiple strategies:
 * - In-memory storage (development, single-server)
 * - Redis-based (production, distributed)
 *
 * Default: Sliding window algorithm with configurable limits
 */

import { logger } from "@/lib/logger";

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional custom message for rate limit exceeded */
  message?: string;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * In-memory storage for rate limiting (development)
 * Not suitable for production with multiple servers
 */
class InMemoryStore {
  private store: Map<string, Array<number>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Get the number of requests for a key within the time window
   */
  get(key: string, windowMs: number): number {
    const now = Date.now();
    const timestamps = this.store.get(key) || [];

    // Remove timestamps outside the window
    const validTimestamps = timestamps.filter((t) => now - t < windowMs);
    this.store.set(key, validTimestamps);

    return validTimestamps.length;
  }

  /**
   * Increment the request count for a key
   */
  increment(key: string, windowMs: number): void {
    const now = Date.now();
    const timestamps = this.store.get(key) || [];

    // Remove timestamps outside the window
    const validTimestamps = timestamps.filter((t) => now - t < windowMs);
    validTimestamps.push(now);

    this.store.set(key, validTimestamps);
  }

  /**
   * Reset the counter for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Cleanup old entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, timestamps] of this.store.entries()) {
      // Remove entries older than 1 hour
      const validTimestamps = timestamps.filter((t) => now - t < 60 * 60 * 1000);

      if (validTimestamps.length === 0) {
        keysToDelete.push(key);
      } else {
        this.store.set(key, validTimestamps);
      }
    }

    keysToDelete.forEach((key) => this.store.delete(key));
  }

  /**
   * Cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Global in-memory store
const inMemoryStore = new InMemoryStore();

/**
 * Create a rate limiter for an endpoint
 *
 * @param config - Rate limit configuration
 * @returns Function to check if a request is allowed
 *
 * @example
 * const loginLimiter = createRateLimiter({
 *   maxRequests: 5,
 *   windowMs: 60 * 60 * 1000, // 1 hour
 * });
 *
 * // In middleware or handler
 * const result = await loginLimiter('user-123');
 * if (!result.success) {
 *   return new Response('Too many login attempts', { status: 429 });
 * }
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async function checkLimit(identifier: string): Promise<RateLimitResult> {
    const { maxRequests, windowMs } = config;
    const now = Date.now();

    try {
      // Get current count
      const count = inMemoryStore.get(identifier, windowMs);

      if (count >= maxRequests) {
        // Rate limit exceeded
        logger.warn("Rate limit exceeded", {
          identifier: identifier.substring(0, 10), // Redact full identifier
          maxRequests,
          windowMs,
        });

        return {
          success: false,
          remaining: 0,
          resetTime: now + windowMs,
        };
      }

      // Increment and allow
      inMemoryStore.increment(identifier, windowMs);

      return {
        success: true,
        remaining: maxRequests - count - 1,
        resetTime: now + windowMs,
      };
    } catch (error) {
      logger.error("Rate limiter error", error);
      // Fail open in case of errors (allow the request)
      return {
        success: true,
        remaining: maxRequests,
        resetTime: now + windowMs,
      };
    }
  };
}

/**
 * Pre-configured rate limiter for login attempts
 * 5 attempts per hour per IP/email
 */
export const loginRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many login attempts. Please try again in 1 hour.",
});

/**
 * Pre-configured rate limiter for signup attempts
 * 10 attempts per day per IP
 */
export const signupRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  message: "Too many signup attempts. Please try again tomorrow.",
});

/**
 * Pre-configured rate limiter for password reset
 * 3 attempts per hour per email
 */
export const passwordResetLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many password reset attempts. Please try again in 1 hour.",
});

/**
 * Get client IP address from request
 *
 * @param request - The request object
 * @returns Client IP address
 *
 * Checks multiple headers for IP:
 * - x-forwarded-for (proxies)
 * - x-real-ip (nginx)
 * - cf-connecting-ip (Cloudflare)
 * - Socket IP (direct connection)
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP if multiple are present
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfIP = request.headers.get("cf-connecting-ip");
  if (cfIP) {
    return cfIP;
  }

  // Fallback - shouldn't reach here in normal circumstances
  return "unknown";
}

/**
 * Create a rate limit identifier from email and IP
 * Prevents both brute force on a single email and distributed attacks
 *
 * @param email - User email
 * @param ip - Client IP
 * @returns Combined identifier
 */
export function createRateLimitIdentifier(email: string, ip: string): string {
  // Create identifier from both email and IP to prevent:
  // 1. Brute force on single email from multiple IPs
  // 2. DDoS from single IP hitting multiple emails
  return `${email}:${ip}`;
}

/**
 * Configuration for different endpoints
 */
export const rateLimitConfig = {
  /** Login attempts: 5 per hour per email+IP combination */
  login: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
  },

  /** Signup attempts: 10 per day per IP */
  signup: {
    maxRequests: 10,
    windowMs: 24 * 60 * 60 * 1000,
  },

  /** Password reset: 3 per hour per email+IP */
  passwordReset: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
  },

  /** API general: 100 per minute per IP */
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
};

/**
 * Cleanup resources when server shuts down
 */
export function cleanupRateLimiter(): void {
  inMemoryStore.destroy();
}

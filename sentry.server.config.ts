import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

/**
 * Sentry configuration for server-side error monitoring
 * Initialize Sentry to capture server-side errors and performance issues
 */
export function initializeSentry() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    logger.warn("Sentry DSN not configured. Error monitoring disabled.");
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Capture unhandled promise rejections
    attachStacktrace: true,

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      // Network errors that are expected
      "NetworkError",
      "Failed to fetch",
    ],

    // Capture breadcrumbs
    maxBreadcrumbs: 50,
  });
}

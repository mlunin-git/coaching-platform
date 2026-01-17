/**
 * Client-side Sentry initialization
 *
 * Called during client-side startup via the instrumentation-client file.
 */

import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

let isInitialized = false;

export function initClientSentry(): void {
  if (isInitialized) {
    return;
  }

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
      "chrome-extension://",
      "moz-extension://",
      // Network errors that are expected
      "NetworkError",
      "Failed to fetch",
      // Third-party script errors
      "Script error",
    ],

    // Only capture errors from our domain
    beforeSend(event) {
      // Filter out errors from third-party scripts
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.stacktrace?.frames) {
          const hasOurCode = error.stacktrace.frames.some(
            (frame) => frame.filename && !frame.filename.includes("extension://")
          );
          if (!hasOurCode) return null;
        }
      }
      return event;
    },

    // Capture breadcrumbs
    maxBreadcrumbs: 50,
  });

  isInitialized = true;
  logger.info("Sentry client-side monitoring initialized");
}

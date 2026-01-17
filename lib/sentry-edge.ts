/**
 * Edge runtime Sentry initialization
 *
 * Called during edge runtime startup via the instrumentation file.
 */

import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

let isInitialized = false;

export function initEdgeSentry(): void {
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

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",

    // Capture breadcrumbs
    maxBreadcrumbs: 50,
  });

  isInitialized = true;
}

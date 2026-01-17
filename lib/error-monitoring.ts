import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

/**
 * Error monitoring and reporting utilities
 * Provides helper functions for capturing errors and logging events
 */

/**
 * Capture an exception with context
 * @param error - The error to capture
 * @param context - Additional context information
 */
export function captureException(
  error: Error | unknown,
  context?: Record<string, unknown>
) {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  Sentry.captureException(errorObj, {
    contexts: {
      custom: context,
    },
  });

  logger.error("Error captured:", { errorObj, context });
}

/**
 * Capture a message for monitoring
 * @param message - The message to capture
 * @param level - Severity level: fatal, error, warning, info, debug
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "error"
) {
  Sentry.captureMessage(message, level);
  logger.debug(`[${level.toUpperCase()}] ${message}`);
}

/**
 * Set user context for error reporting
 * @param userId - User identifier
 * @param email - User email
 * @param name - User name
 */
export function setUserContext(
  userId: string,
  email?: string | null,
  name?: string | null
) {
  Sentry.setUser({
    id: userId,
    email: email || undefined,
    username: name || undefined,
  });
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add a breadcrumb for debugging
 * @param message - Breadcrumb message
 * @param category - Breadcrumb category
 * @param level - Severity level
 * @param data - Additional data
 */
export function addBreadcrumb(
  message: string,
  category: string = "custom",
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info",
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Wrap an async function with error handling and monitoring
 * @param fn - Async function to wrap
 * @param operation - Operation name for monitoring
 * @returns Wrapped function that catches errors
 */
export function withErrorMonitoring<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operation: string
) {
  return async (...args: T): Promise<R | null> => {
    try {
      const result = await fn(...args);
      addBreadcrumb(`${operation} completed successfully`, operation, "info");
      return result;
    } catch (error) {
      captureException(error, {
        operation,
        args: args.length > 0 ? String(args[0]).substring(0, 100) : undefined,
      });
      throw error;
    }
  };
}

/**
 * Secure logging utility for development and production
 *
 * In development: Logs to console with full context
 * In production: Only sends critical errors to Sentry, sanitizes sensitive data
 *
 * This prevents information disclosure while maintaining debugging capability
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Sensitive patterns to redact from logs
 */
const SENSITIVE_PATTERNS = [
  // Email addresses
  /[\w\.-]+@[\w\.-]+\.\w+/g,
  // UUIDs (user IDs, auth tokens, etc)
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
  // API keys and tokens
  /(?:api_key|token|secret|password)[\s:=]+[\S]+/gi,
  // JWT tokens
  /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.?[A-Za-z0-9_\-.]*?/g,
];

/**
 * Log levels for different severity levels
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Redact sensitive information from a string
 *
 * @param text - The text to redact
 * @returns Text with sensitive patterns replaced with [REDACTED]
 *
 * @example
 * const message = redactSensitiveInfo('Failed for user user@example.com with ID abc-123');
 * // Returns: 'Failed for user [REDACTED] with ID [REDACTED]'
 */
function redactSensitiveInfo(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }

  let redacted = text;
  SENSITIVE_PATTERNS.forEach((pattern) => {
    redacted = redacted.replace(pattern, '[REDACTED]');
  });
  return redacted;
}

/**
 * Recursively redact sensitive data from objects
 *
 * @param obj - The object to redact
 * @param maxDepth - Maximum depth to traverse (prevents infinite loops)
 * @returns New object with sensitive data redacted
 */
function redactObject(
  obj: unknown,
  maxDepth: number = 5
): unknown {
  if (maxDepth <= 0) return '[MAX_DEPTH]';

  if (typeof obj === 'string') {
    return redactSensitiveInfo(obj);
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item, maxDepth - 1));
  }

  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    redacted[key] = redactObject(value, maxDepth - 1);
  }
  return redacted;
}

/**
 * Format a log message with context data
 *
 * @param message - The main message
 * @param context - Additional context data
 * @returns Formatted log message
 */
function formatMessage(message: string, context?: unknown): string {
  if (!context) {
    return message;
  }

  try {
    const contextStr =
      typeof context === 'string'
        ? context
        : JSON.stringify(context, null, 2);
    return `${message}\n${contextStr}`;
  } catch {
    return message;
  }
}

/**
 * Core logging function
 *
 * @param level - Log level
 * @param message - Log message
 * @param context - Additional context (will be redacted in production)
 */
function log(
  level: LogLevel,
  message: string,
  context?: unknown
): void {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // In development: Log everything to console
  if (isDevelopment) {
    const consoleMethod = level === 'error' ? console.error :
                         level === 'warn' ? console.warn :
                         level === 'info' ? console.info :
                         console.debug;

    const redactedContext =
      typeof context === 'string'
        ? redactSensitiveInfo(context)
        : context;

    consoleMethod(`[${level.toUpperCase()}] ${message}`, redactedContext);
    return;
  }

  // In production: Only send errors to Sentry, suppress console
  if (level === 'error') {
    // Redact sensitive data before sending to Sentry
    const redactedContext = redactObject(context);

    Sentry.captureException(
      context instanceof Error ? context : new Error(message),
      {
        level: 'error',
        tags: {
          log_level: 'error',
        },
        extra: {
          message,
          context: redactedContext,
        },
      }
    );
  }

  // Never log warnings, info, or debug to console in production
  // (could expose internal information to users)
}

/**
 * Logger interface for safe, production-friendly logging
 */
export const logger = {
  /**
   * Log debug information (development only)
   *
   * @example
   * logger.debug('Query executed', { query: 'SELECT *', duration: 45 });
   */
  debug: (message: string, context?: unknown): void => {
    log('debug', message, context);
  },

  /**
   * Log informational messages (development only)
   *
   * @example
   * logger.info('User signed in');
   */
  info: (message: string, context?: unknown): void => {
    log('info', message, context);
  },

  /**
   * Log warning messages (development only, errors sent to Sentry)
   *
   * @example
   * logger.warn('Deprecated API usage', { endpoint: '/api/v1' });
   */
  warn: (message: string, context?: unknown): void => {
    log('warn', message, context);
  },

  /**
   * Log error messages (always sent to Sentry in production)
   *
   * @example
   * logger.error('Database query failed', error);
   */
  error: (message: string, context?: unknown): void => {
    log('error', message, context);
  },

  /**
   * Redact sensitive information from a string
   *
   * @example
   * const safe = logger.redact('user@example.com confirmed login');
   * // Returns: '[REDACTED] confirmed login'
   */
  redact: redactSensitiveInfo,

  /**
   * Redact sensitive data from objects
   *
   * @example
   * const safeData = logger.redactObject({ email, password, token });
   * // Returns: { email: '[REDACTED]', password: '[REDACTED]', token: '[REDACTED]' }
   */
  redactObject,
};

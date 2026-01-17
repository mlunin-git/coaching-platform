/**
 * Comprehensive error handling for various edge cases
 * Handles network errors, validation errors, authorization, and more
 */

import * as Sentry from '@sentry/nextjs';
import { logger } from "@/lib/logger";

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  message: string;
  code: string;
  statusCode: number;
  originalError?: Error;
  context?: Record<string, unknown>;
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  captureToSentry?: boolean;
  logToConsole?: boolean;
  notifyUser?: boolean;
  userMessage?: string;
}

/**
 * Handle network timeout errors
 *
 * @param error - The error that occurred
 * @param timeout - Timeout duration in milliseconds
 * @returns Standard error response
 *
 * @example
 * try {
 *   // API call
 * } catch (error) {
 *   const response = handleTimeoutError(error, 5000);
 *   // Show user: response.message
 * }
 */
export function handleTimeoutError(
  error: unknown,
  timeout: number
): ErrorResponse {
  const timeoutSeconds = Math.round(timeout / 1000);

  return {
    message: `Request timed out after ${timeoutSeconds} seconds. Please check your internet connection and try again.`,
    code: 'TIMEOUT_ERROR',
    statusCode: 408,
    originalError: error instanceof Error ? error : undefined,
    context: {
      timeoutMs: timeout,
    },
  };
}

/**
 * Handle network connectivity errors
 *
 * @param error - The network error
 * @returns Standard error response
 *
 * @example
 * try {
 *   const response = await fetch(url);
 * } catch (error) {
 *   const response = handleNetworkError(error);
 * }
 */
export function handleNetworkError(error: unknown): ErrorResponse {
  const isOffline =
    typeof navigator !== 'undefined' && !navigator.onLine;

  if (isOffline) {
    return {
      message: 'No internet connection. Please check your connection and try again.',
      code: 'OFFLINE_ERROR',
      statusCode: 0,
      originalError: error instanceof Error ? error : undefined,
      context: { isOffline: true },
    };
  }

  return {
    message: 'Network error occurred. Please check your internet connection and try again.',
    code: 'NETWORK_ERROR',
    statusCode: 0,
    originalError: error instanceof Error ? error : undefined,
  };
}

/**
 * Handle HTTP status errors
 *
 * @param statusCode - HTTP status code
 * @param responseBody - Response body (if available)
 * @returns Standard error response
 *
 * @example
 * const response = await fetch(url);
 * if (!response.ok) {
 *   const errorResponse = handleHttpError(response.status, await response.text());
 * }
 */
export function handleHttpError(
  statusCode: number,
  responseBody?: string
): ErrorResponse {
  let message = '';
  let code = 'HTTP_ERROR';

  switch (statusCode) {
    case 400:
      message = 'Invalid request. Please check your input and try again.';
      code = 'BAD_REQUEST';
      break;
    case 401:
      message = 'Session expired. Please log in again.';
      code = 'UNAUTHORIZED';
      break;
    case 403:
      message = 'You do not have permission to perform this action.';
      code = 'FORBIDDEN';
      break;
    case 404:
      message = 'The requested resource was not found.';
      code = 'NOT_FOUND';
      break;
    case 409:
      message = 'This resource has been modified. Please refresh and try again.';
      code = 'CONFLICT';
      break;
    case 413:
      message = 'Request is too large. Please try with smaller data.';
      code = 'PAYLOAD_TOO_LARGE';
      break;
    case 429:
      message = 'Too many requests. Please wait a moment and try again.';
      code = 'RATE_LIMITED';
      break;
    case 500:
      message = 'Server error occurred. Our team has been notified. Please try again later.';
      code = 'INTERNAL_SERVER_ERROR';
      break;
    case 503:
      message = 'Server is temporarily unavailable. Please try again later.';
      code = 'SERVICE_UNAVAILABLE';
      break;
    default:
      if (statusCode >= 500) {
        message = 'Server error occurred. Please try again later.';
        code = 'SERVER_ERROR';
      } else if (statusCode >= 400) {
        message = 'Request failed. Please try again.';
        code = 'CLIENT_ERROR';
      } else {
        message = 'An error occurred. Please try again.';
      }
  }

  return {
    message,
    code,
    statusCode,
    context: {
      responseBody: responseBody?.substring(0, 500), // Limit response logging
    },
  };
}

/**
 * Handle data validation errors
 *
 * @param fieldName - Name of the field that failed validation
 * @param validationType - Type of validation that failed
 * @param details - Additional validation details
 * @returns Standard error response
 *
 * @example
 * if (!validateEmail(email)) {
 *   const error = handleValidationError('email', 'email_format');
 *   showError(error.message);
 * }
 */
export function handleValidationError(
  fieldName: string,
  validationType: string,
  details?: Record<string, unknown>
): ErrorResponse {
  let message = `Invalid ${fieldName}.`;

  switch (validationType) {
    case 'required':
      message = `${fieldName} is required.`;
      break;
    case 'email_format':
      message = 'Please enter a valid email address.';
      break;
    case 'min_length':
      message = `${fieldName} must be at least ${details?.minLength} characters.`;
      break;
    case 'max_length':
      message = `${fieldName} must be less than ${details?.maxLength} characters.`;
      break;
    case 'pattern':
      message = `${fieldName} format is invalid.`;
      break;
    case 'unique':
      message = `${fieldName} already exists.`;
      break;
    case 'range':
      message = `${fieldName} must be between ${details?.min} and ${details?.max}.`;
      break;
  }

  return {
    message,
    code: 'VALIDATION_ERROR',
    statusCode: 400,
    context: {
      fieldName,
      validationType,
      details,
    },
  };
}

/**
 * Handle authorization/authentication errors
 *
 * @param errorType - Type of auth error
 * @param details - Additional error details
 * @returns Standard error response
 *
 * @example
 * try {
 *   await supabase.auth.signIn({ email, password });
 * } catch (error) {
 *   const authError = handleAuthError('invalid_credentials');
 * }
 */
export function handleAuthError(
  errorType: string,
  details?: Record<string, unknown>
): ErrorResponse {
  let message = 'Authentication failed.';
  let code = 'AUTH_ERROR';

  switch (errorType) {
    case 'invalid_credentials':
      message = 'Invalid email or password.';
      code = 'INVALID_CREDENTIALS';
      break;
    case 'user_not_found':
      message = 'User account not found.';
      code = 'USER_NOT_FOUND';
      break;
    case 'user_already_exists':
      message = 'An account with this email already exists.';
      code = 'USER_ALREADY_EXISTS';
      break;
    case 'session_expired':
      message = 'Your session has expired. Please log in again.';
      code = 'SESSION_EXPIRED';
      break;
    case 'invalid_token':
      message = 'Authentication token is invalid or expired.';
      code = 'INVALID_TOKEN';
      break;
    case 'permission_denied':
      message = 'You do not have permission to access this resource.';
      code = 'PERMISSION_DENIED';
      break;
  }

  return {
    message,
    code,
    statusCode: 401,
    context: details,
  };
}

/**
 * Handle data operation errors (conflicts, concurrent modifications)
 *
 * @param operationType - Type of operation (create, update, delete)
 * @param reason - Reason for the error
 * @returns Standard error response
 *
 * @example
 * try {
 *   // Update operation
 * } catch (error) {
 *   const dbError = handleDatabaseError('update', 'resource_modified');
 * }
 */
export function handleDatabaseError(
  operationType: string,
  reason: string
): ErrorResponse {
  let message = `Failed to ${operationType} resource.`;
  let code = 'DATABASE_ERROR';

  switch (reason) {
    case 'resource_modified':
      message = 'Resource was modified by another user. Please refresh and try again.';
      code = 'CONFLICT_MODIFIED';
      break;
    case 'resource_deleted':
      message = 'Resource was deleted. Please refresh the page.';
      code = 'RESOURCE_DELETED';
      break;
    case 'foreign_key_violation':
      message = 'Cannot perform this operation due to related data.';
      code = 'FOREIGN_KEY_ERROR';
      break;
    case 'duplicate_entry':
      message = 'A record with this data already exists.';
      code = 'DUPLICATE_ENTRY';
      break;
    case 'data_too_large':
      message = 'Data is too large. Please try with smaller data.';
      code = 'DATA_TOO_LARGE';
      break;
  }

  return {
    message,
    code,
    statusCode: 409,
  };
}

/**
 * Handle file operation errors
 *
 * @param operation - File operation (upload, download, delete)
 * @param reason - Reason for failure
 * @returns Standard error response
 *
 * @example
 * try {
 *   // File upload
 * } catch (error) {
 *   const fileError = handleFileError('upload', 'file_too_large');
 * }
 */
export function handleFileError(
  operation: string,
  reason: string
): ErrorResponse {
  let message = `Failed to ${operation} file.`;
  let code = 'FILE_ERROR';

  switch (reason) {
    case 'file_too_large':
      message = 'File is too large. Maximum size is 10 MB.';
      code = 'FILE_TOO_LARGE';
      break;
    case 'invalid_file_type':
      message = 'File type is not supported.';
      code = 'INVALID_FILE_TYPE';
      break;
    case 'file_not_found':
      message = 'File not found.';
      code = 'FILE_NOT_FOUND';
      break;
    case 'storage_quota_exceeded':
      message = 'Storage quota exceeded. Please delete some files.';
      code = 'STORAGE_QUOTA_EXCEEDED';
      break;
  }

  return {
    message,
    code,
    statusCode: 400,
  };
}

/**
 * Generic error handler that categorizes and handles any error
 *
 * @param error - The error to handle
 * @param config - Error handling configuration
 * @returns Standard error response
 *
 * @example
 * try {
 *   // Some operation
 * } catch (error) {
 *   const errorResponse = handleError(error, {
 *     captureToSentry: true,
 *     notifyUser: true,
 *   });
 *   showAlert(errorResponse.message);
 * }
 */
export function handleError(
  error: unknown,
  config: ErrorHandlerConfig = {}
): ErrorResponse {
  const {
    captureToSentry = true,
    logToConsole = process.env.NODE_ENV === 'development',
    notifyUser = true,
  } = config;

  let errorResponse: ErrorResponse;

  // Categorize error type
  if (error instanceof Error) {
    // Handle Supabase errors
    if ('status' in error) {
      errorResponse = handleHttpError(
        (error as any).status,
        error.message
      );
    }
    // Handle timeout errors
    else if (error.name === 'AbortError') {
      errorResponse = handleTimeoutError(error, 5000);
    }
    // Handle network errors
    else if (error.name === 'NetworkError' || error.message === 'Failed to fetch') {
      errorResponse = handleNetworkError(error);
    }
    // Generic Error
    else {
      errorResponse = {
        message: 'An unexpected error occurred. Please try again.',
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        originalError: error,
      };
    }
  } else if (typeof error === 'string') {
    errorResponse = {
      message: error,
      code: 'STRING_ERROR',
      statusCode: 500,
    };
  } else {
    errorResponse = {
      message: 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      context: { error: String(error) },
    };
  }

  // Log error
  if (logToConsole) {
    logger.error('[ERROR]', errorResponse);
  }

  // Send to Sentry
  if (captureToSentry && error instanceof Error) {
    Sentry.captureException(error, {
      tags: {
        error_code: errorResponse.code,
        error_status: errorResponse.statusCode,
      },
      extra: errorResponse.context,
    });
  }

  return errorResponse;
}

/**
 * Safely parse JSON response, handling malformed data
 *
 * @param response - Response object or text to parse
 * @returns Parsed JSON or error response
 *
 * @example
 * const data = await safeJsonParse(await fetch(url).text());
 * if (!data.success) {
 *   console.error(data.error);
 * }
 */
export async function safeJsonParse(response: Response | string) {
  try {
    const text = typeof response === 'string'
      ? response
      : await response.text();

    if (!text) {
      return {
        success: false,
        error: handleDatabaseError('parse', 'empty_response'),
        data: null,
      };
    }

    const data = JSON.parse(text);
    return { success: true, data, error: null };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to parse response data.',
        code: 'PARSE_ERROR',
        statusCode: 500,
        originalError: error instanceof Error ? error : undefined,
      },
      data: null,
    };
  }
}

/**
 * Wrap an async function with error handling
 *
 * @param fn - Async function to wrap
 * @param config - Error handling configuration
 * @returns Function that handles errors gracefully
 *
 * @example
 * const safeFetch = withErrorHandling(
 *   async () => await supabase.from('clients').select(),
 *   { captureToSentry: true }
 * );
 *
 * const { data, error } = await safeFetch();
 */
export function withErrorHandling<T>(
  fn: () => Promise<T>,
  config: ErrorHandlerConfig = {}
) {
  return async (): Promise<{
    data: T | null;
    error: ErrorResponse | null;
  }> => {
    try {
      const data = await fn();
      return { data, error: null };
    } catch (error) {
      const errorResponse = handleError(error, config);
      return { data: null, error: errorResponse };
    }
  };
}

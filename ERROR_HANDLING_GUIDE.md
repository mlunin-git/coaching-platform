# Comprehensive Error Handling Guide

This guide covers error handling patterns, edge cases, and best practices for the Coaching Platform.

## Overview

The application uses a multi-layered error handling approach:

1. **Validation Errors** - Input validation before database operations
2. **Network Errors** - Timeout and connectivity issues
3. **HTTP Errors** - Status codes from API responses
4. **Database Errors** - Conflicts and data integrity issues
5. **Authorization Errors** - Authentication and permission issues
6. **File Operation Errors** - Upload/download failures
7. **Generic Error Fallback** - Unknown errors with user-friendly messages

## Error Categories & Handling

### 1. Network Errors

#### Timeout Errors

```typescript
import { handleTimeoutError } from '@/lib/error-handler';

try {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
} catch (error) {
  if (error.name === 'AbortError') {
    const errorResponse = handleTimeoutError(error, 5000);
    // errorResponse.message = "Request timed out after 5 seconds..."
  }
}
```

#### Offline Detection

```typescript
import { handleNetworkError } from '@/lib/error-handler';

// Monitor connection status
window.addEventListener('online', () => {
  console.log('Back online - retry operations');
});

window.addEventListener('offline', () => {
  console.log('Network offline');
  const errorResponse = handleNetworkError(new Error('Offline'));
  // errorResponse.message = "No internet connection..."
});
```

### 2. HTTP Status Errors

#### Handling Specific Status Codes

```typescript
import { handleHttpError } from '@/lib/error-handler';

try {
  const response = await fetch(url);

  if (!response.ok) {
    const errorResponse = handleHttpError(
      response.status,
      await response.text()
    );

    switch (response.status) {
      case 401:
        // Re-authenticate user
        redirectToLogin();
        break;
      case 403:
        // Show permission error
        showAlert(errorResponse.message);
        break;
      case 404:
        // Handle not found
        showNotFoundError();
        break;
      case 429:
        // Rate limited - implement retry with backoff
        retryWithExponentialBackoff();
        break;
      case 500:
        // Server error - show support message
        showServerErrorAlert();
        break;
    }
  }
} catch (error) {
  const errorResponse = handleHttpError(500);
}
```

### 3. Validation Errors

#### Field-Level Validation

```typescript
import { handleValidationError } from '@/lib/error-handler';

function validateForm(data: FormData) {
  const errors: Record<string, ErrorResponse> = {};

  if (!data.email) {
    errors.email = handleValidationError('email', 'required');
  } else if (!isValidEmail(data.email)) {
    errors.email = handleValidationError('email', 'email_format');
  }

  if (!data.password || data.password.length < 8) {
    errors.password = handleValidationError(
      'password',
      'min_length',
      { minLength: 8 }
    );
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
```

#### Unique Field Validation

```typescript
const emailError = handleValidationError(
  'email',
  'unique',
  { existingValue: 'user@example.com' }
);
// "email already exists."
```

### 4. Authorization Errors

#### Authentication Failures

```typescript
import { handleAuthError } from '@/lib/error-handler';

try {
  await supabase.auth.signInWithPassword({
    email,
    password,
  });
} catch (error) {
  if (error.message.includes('Invalid login')) {
    const authError = handleAuthError('invalid_credentials');
    showError(authError.message);
  } else if (error.message.includes('user_not_found')) {
    const authError = handleAuthError('user_not_found');
  }
}
```

#### Session Expiration

```typescript
// Detect expired session
if (response.status === 401) {
  const authError = handleAuthError('session_expired');
  // Clear local session
  localStorage.removeItem('auth_token');
  // Redirect to login
  router.push('/auth/login');
}
```

### 5. Database & Data Errors

#### Conflict Resolution (Concurrent Modifications)

```typescript
import { handleDatabaseError } from '@/lib/error-handler';

try {
  const { error } = await supabase
    .from('clients')
    .update(updatedData)
    .eq('id', clientId)
    .eq('updated_at', lastKnownUpdateTime);

  if (error?.code === 'CONFLICT') {
    const dbError = handleDatabaseError('update', 'resource_modified');
    // Prompt user to refresh and retry
    showConflictDialog(dbError.message);
  }
} catch (error) {
  const dbError = handleDatabaseError('update', 'unknown');
}
```

#### Foreign Key Violations

```typescript
try {
  await supabase.from('tasks').delete().eq('id', taskId);
} catch (error) {
  if (error.message.includes('foreign key')) {
    const dbError = handleDatabaseError('delete', 'foreign_key_violation');
    showAlert(dbError.message);
    // "Cannot perform this operation due to related data."
  }
}
```

### 6. File Operation Errors

```typescript
import { handleFileError } from '@/lib/error-handler';

async function uploadFile(file: File) {
  // Validate file size
  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxSize) {
    const fileError = handleFileError('upload', 'file_too_large');
    return { error: fileError };
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    const fileError = handleFileError('upload', 'invalid_file_type');
    return { error: fileError };
  }

  try {
    const { error } = await supabase.storage
      .from('documents')
      .upload(`path/${file.name}`, file);

    if (error) {
      throw error;
    }
  } catch (error) {
    const fileError = handleFileError('upload', 'storage_error');
    return { error: fileError };
  }
}
```

## Best Practices

### 1. Use Error Wrapping for Async Operations

```typescript
import { withErrorHandling } from '@/lib/error-handler';

// Wrap async functions
const safeLoadClients = withErrorHandling(
  async () => {
    const { data } = await supabase
      .from('clients')
      .select('*');
    return data;
  },
  { captureToSentry: true, notifyUser: true }
);

// Use with automatic error handling
const { data, error } = await safeLoadClients();
if (error) {
  showAlert(error.message);
}
```

### 2. Always Show User-Friendly Messages

```typescript
// ❌ BAD - Technical error message
showAlert(error.message); // "Error: Request failed with status 500"

// ✅ GOOD - User-friendly message
const errorResponse = handleError(error);
showAlert(errorResponse.message); // "Server error occurred. Please try again later."
```

### 3. Log Context with Errors

```typescript
const errorResponse = handleError(error, {
  captureToSentry: true, // Send to Sentry with context
});

// Error captured with:
// - Error code (e.g., 'TIMEOUT_ERROR')
// - Status code (e.g., 408)
// - Context information (e.g., timeout duration)
```

### 4. Handle Edge Cases in Forms

```typescript
async function handleFormSubmit(e: React.FormEvent) {
  e.preventDefault();

  // Validation errors
  const validation = validateForm(formData);
  if (!validation.isValid) {
    setFormErrors(validation.errors);
    return;
  }

  try {
    // Network timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await submitForm(formData);
    clearTimeout(timeoutId);

    // Success
    showSuccess('Submitted successfully!');
    resetForm();
  } catch (error) {
    if (error instanceof AbortError) {
      showError('Request timed out. Please try again.');
    } else {
      const errorResponse = handleError(error);
      showError(errorResponse.message);
    }
  }
}
```

### 5. Implement Retry Logic for Transient Errors

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error; // Final attempt failed
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}

// Usage
const data = await retryWithBackoff(
  () => supabase.from('clients').select('*')
);
```

### 6. Handle Concurrent Operations

```typescript
const operationQueue: Promise<any>[] = [];

async function queueOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  const promise = Promise.all(operationQueue).then(() => operation());
  operationQueue.push(promise);

  try {
    return await promise;
  } catch (error) {
    const dbError = handleDatabaseError(
      'operation',
      'concurrent_conflict'
    );
    throw error;
  } finally {
    // Remove from queue
    operationQueue.splice(operationQueue.indexOf(promise), 1);
  }
}
```

## Common Scenarios

### Scenario 1: User Offline, Then Comes Online

```typescript
// Component initializes
let pendingOperations: (() => Promise<any>)[] = [];

// Operation attempted while offline
const attemptOperation = async () => {
  try {
    return await supabase.from('tasks').select();
  } catch (error) {
    if (!navigator.onLine) {
      // Queue for retry
      pendingOperations.push(attemptOperation);
      const netError = handleNetworkError(error);
      showAlert(netError.message);
      return null;
    }
    throw error;
  }
};

// Listen for connection restoration
window.addEventListener('online', async () => {
  showAlert('Connection restored. Syncing data...');

  // Retry all pending operations
  for (const operation of pendingOperations) {
    try {
      await operation();
    } catch (error) {
      const errorResponse = handleError(error);
      showAlert(errorResponse.message);
    }
  }

  pendingOperations = [];
});
```

### Scenario 2: Concurrent Edit Conflict

```typescript
// User A and User B both edit same client
try {
  const { error } = await supabase
    .from('clients')
    .update({ name: newName })
    .eq('id', clientId)
    .eq('version', currentVersion); // Optimistic locking

  if (error?.code === 'CONFLICT') {
    const dbError = handleDatabaseError('update', 'resource_modified');

    // Show conflict dialog
    showConflictDialog({
      title: 'This resource was changed',
      message: dbError.message,
      onRefresh: () => {
        // Reload fresh data
        loadClient();
      },
      onOverwrite: () => {
        // Force update (use with caution)
        forceUpdateClient();
      },
    });
  }
} catch (error) {
  const errorResponse = handleError(error);
}
```

### Scenario 3: Large File Upload with Progress

```typescript
async function uploadFileWithRetry(file: File, clientId: string) {
  const maxRetries = 3;
  let lastError: ErrorResponse | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const fileError = validateFileUpload(file);
      if (fileError) return { error: fileError };

      const response = await uploadToSupabase(file, {
        onProgress: (progress) => {
          updateProgressBar(progress);
        },
      });

      return { data: response };
    } catch (error) {
      lastError = handleError(error, {
        captureToSentry: attempt === maxRetries,
      });

      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt - 1);
        showAlert(`Upload failed, retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return { error: lastError };
}
```

## Error Response Structure

```typescript
interface ErrorResponse {
  message: string;        // User-friendly error message
  code: string;          // Machine-readable error code
  statusCode: number;    // HTTP-like status code
  originalError?: Error; // Original Error object
  context?: Record<string, unknown>; // Additional context
}

// Example:
{
  message: "Request timed out after 5 seconds. Please check your internet connection and try again.",
  code: "TIMEOUT_ERROR",
  statusCode: 408,
  context: {
    timeoutMs: 5000,
    operationType: "fetch_clients"
  }
}
```

## Testing Error Scenarios

### Unit Tests

```typescript
import { handleTimeoutError, handleNetworkError } from '@/lib/error-handler';

describe('Error Handlers', () => {
  it('should handle timeout errors', () => {
    const error = handleTimeoutError(new Error('Timeout'), 5000);
    expect(error.code).toBe('TIMEOUT_ERROR');
    expect(error.statusCode).toBe(408);
    expect(error.message).toContain('5 seconds');
  });

  it('should handle network errors', () => {
    const error = handleNetworkError(new Error('Network failed'));
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toContain('internet connection');
  });
});
```

## Error Monitoring with Sentry

All critical errors are automatically sent to Sentry with:

- Error code and message
- HTTP status code
- User context (when available)
- Custom tags for filtering
- Additional context data

Monitor errors in Sentry dashboard:
1. Go to **Issues** section
2. Filter by error code or type
3. Review context and breadcrumbs
4. Set up alerts for critical errors

## Checklist for Error Handling

- [ ] All API calls have try-catch blocks
- [ ] Network errors are handled gracefully
- [ ] User sees friendly error messages
- [ ] Errors are logged to Sentry with context
- [ ] Retry logic implemented for transient errors
- [ ] Concurrent operations handled correctly
- [ ] Session expiration detected and handled
- [ ] File operations validated before upload
- [ ] Offline mode detected and handled
- [ ] Form validation errors displayed clearly

## References

- [Error Handling in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [Network Error Handling](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Sentry Error Tracking](https://docs.sentry.io/)
- [Form Validation Best Practices](https://web.dev/articles/form-design)

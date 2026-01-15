/**
 * Comprehensive input validation utilities
 * Validates user input before sending to database
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate name (required, 2-255 chars, no special chars)
 */
export function validateName(name: string): boolean {
  if (!name || name.trim().length < 2) return false;
  if (name.length > 255) return false;
  // Allow alphanumeric, spaces, hyphens, apostrophes
  return /^[a-zA-Z0-9\s\-']+$/.test(name);
}

/**
 * Validate password strength
 * - At least 8 characters
 * - Mix of uppercase, lowercase, numbers
 */
export function validatePassword(password: string): boolean {
  if (!password || password.length < 8) return false;
  if (password.length > 128) return false;
  // Check for uppercase, lowercase, number
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumber;
}

/**
 * Validate title/name field (for tasks, groups, etc)
 */
export function validateTitle(title: string): boolean {
  if (!title || title.trim().length === 0) return false;
  if (title.length > 500) return false;
  return true;
}

/**
 * Validate description field
 */
export function validateDescription(description: string | null | undefined): boolean {
  if (!description) return true; // Optional
  if (description.length > 5000) return false;
  return true;
}

/**
 * Validate that a value is not empty
 */
export function validateRequired(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/**
 * Validate dates
 */
export function validateDateRange(startDate: string, endDate?: string): boolean {
  try {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return false;

    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) return false;
      if (end < start) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate color hex format
 */
export function validateColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Validate location string
 */
export function validateLocation(location?: string): boolean {
  if (!location) return true; // Optional
  if (location.length > 255) return false;
  return true;
}

/**
 * Validate client name for creation
 */
export function validateClientCreation(name: string, email?: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!validateName(name)) {
    errors.push({
      field: "name",
      message: "Name must be 2-255 characters with valid characters only"
    });
  }

  if (email && !validateEmail(email)) {
    errors.push({
      field: "email",
      message: "Please provide a valid email address"
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate group creation
 */
export function validateGroupCreation(name: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!validateTitle(name)) {
    errors.push({
      field: "name",
      message: "Group name is required (max 500 characters)"
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate task creation
 */
export function validateTaskCreation(title: string, description?: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!validateTitle(title)) {
    errors.push({
      field: "title",
      message: "Task title is required (max 500 characters)"
    });
  }

  if (!validateDescription(description)) {
    errors.push({
      field: "description",
      message: "Description must be under 5000 characters"
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate event creation
 */
export function validateEventCreation(
  title: string,
  startDate: string,
  endDate?: string,
  location?: string
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!validateTitle(title)) {
    errors.push({
      field: "title",
      message: "Event title is required (max 500 characters)"
    });
  }

  if (!validateDateRange(startDate, endDate)) {
    errors.push({
      field: "dates",
      message: "Please provide valid dates (end date must be after start date)"
    });
  }

  if (!validateLocation(location)) {
    errors.push({
      field: "location",
      message: "Location must be under 255 characters"
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate participant creation
 */
export function validateParticipant(name: string, color?: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!validateName(name)) {
    errors.push({
      field: "name",
      message: "Participant name must be 2-255 characters"
    });
  }

  if (color && !validateColor(color)) {
    errors.push({
      field: "color",
      message: "Please provide a valid hex color (e.g., #FF5733)"
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate idea creation
 */
export function validateIdeaCreation(title: string, description?: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!validateTitle(title)) {
    errors.push({
      field: "title",
      message: "Idea title is required (max 500 characters)"
    });
  }

  if (!validateDescription(description)) {
    errors.push({
      field: "description",
      message: "Description must be under 5000 characters"
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate message content
 */
export function validateMessage(content: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!validateRequired(content)) {
    errors.push({
      field: "content",
      message: "Message cannot be empty"
    });
  }

  if (content.length > 10000) {
    errors.push({
      field: "content",
      message: "Message must be under 10000 characters"
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

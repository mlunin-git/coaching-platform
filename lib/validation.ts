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
 * @param email - Email address to validate
 * @returns true if email is valid (RFC 5322 simplified), false otherwise
 * @example
 * validateEmail('user@example.com') // true
 * validateEmail('invalid-email') // false
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate person's name
 * Requires 2-255 characters with alphanumeric, spaces, hyphens, and apostrophes
 * @param name - Name to validate
 * @returns true if name meets requirements, false otherwise
 * @example
 * validateName('John Doe') // true
 * validateName('J') // false (too short)
 * validateName('John@Doe') // false (special char not allowed)
 */
export function validateName(name: string): boolean {
  if (!name || name.trim().length < 2) return false;
  if (name.length > 255) return false;
  // Allow alphanumeric, spaces, hyphens, apostrophes
  return /^[a-zA-Z0-9\s\-']+$/.test(name);
}

/**
 * Validate password strength
 * Requires: 8-128 characters with uppercase, lowercase, and numbers
 * @param password - Password to validate
 * @returns true if password is strong enough, false otherwise
 * @example
 * validatePassword('SecurePass123') // true
 * validatePassword('weakpass') // false (no uppercase/numbers)
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
 * Validate title/name field for content (tasks, groups, events, etc)
 * Requires 1-500 characters, not empty after trimming
 * @param title - Title to validate
 * @returns true if title is valid, false otherwise
 * @example
 * validateTitle('My Project') // true
 * validateTitle('   ') // false (only whitespace)
 */
export function validateTitle(title: string): boolean {
  if (!title || title.trim().length === 0) return false;
  if (title.length > 500) return false;
  return true;
}

/**
 * Validate description field (optional)
 * Maximum 5000 characters
 * @param description - Description to validate or null/undefined for optional fields
 * @returns true if valid (allows null/undefined and up to 5000 chars)
 * @example
 * validateDescription('Long description...') // true
 * validateDescription(null) // true (optional)
 */
export function validateDescription(description: string | null | undefined): boolean {
  if (!description) return true; // Optional
  if (description.length > 5000) return false;
  return true;
}

/**
 * Validate that a string value is not empty
 * Trims whitespace before checking
 * @param value - String value to check (can be null/undefined)
 * @returns true if value is non-empty string, false otherwise
 * @example
 * validateRequired('hello') // true
 * validateRequired('   ') // false (whitespace only)
 * validateRequired(null) // false
 */
export function validateRequired(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/**
 * Validate date range for events/activities
 * Checks that dates are valid and end date is not before start date
 * @param startDate - Start date string or Date object
 * @param endDate - Optional end date string or Date object
 * @returns true if dates are valid, false if invalid or out of order
 * @example
 * validateDateRange('2025-01-16', '2025-01-20') // true
 * validateDateRange('2025-01-20', '2025-01-16') // false (end before start)
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
 * Validate hex color code
 * Accepts 6-digit hex colors with or without # prefix (requires #)
 * @param color - Hex color string to validate (e.g., '#FF5733')
 * @returns true if valid hex color, false otherwise
 * @example
 * validateColor('#FF5733') // true
 * validateColor('FF5733') // false (missing #)
 */
export function validateColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Validate location name (optional)
 * Maximum 255 characters, allows most characters
 * @param location - Location string to validate or undefined for optional fields
 * @returns true if valid or undefined, false if exceeds max length
 * @example
 * validateLocation('New York, USA') // true
 * validateLocation(undefined) // true (optional)
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

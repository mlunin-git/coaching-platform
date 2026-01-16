import { useState } from "react";

export interface FieldConfig {
  name: string;
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  validator?: (value: string | number) => string | null; // Returns error message or null
}

/**
 * Hook for managing form validation logic
 * Handles error state, field validation, and error messages
 *
 * @example
 * const { errors, validateField, validateForm, hasError } = useFormValidation();
 *
 * if (!validateField({ name: 'email', value: email, required: true })) {
 *   return;
 * }
 */
export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validate a single field
   * @returns true if valid, false if invalid
   */
  const validateField = (config: FieldConfig): boolean => {
    const { name, value, required, minLength, maxLength, validator } = config;
    const stringValue = String(value).trim();

    // Check required
    if (required && !stringValue) {
      setErrors((prev) => ({
        ...prev,
        [name]: `${name} is required`,
      }));
      return false;
    }

    // Check minLength
    if (minLength && stringValue.length < minLength) {
      setErrors((prev) => ({
        ...prev,
        [name]: `${name} must be at least ${minLength} characters`,
      }));
      return false;
    }

    // Check maxLength
    if (maxLength && stringValue.length > maxLength) {
      setErrors((prev) => ({
        ...prev,
        [name]: `${name} must be less than ${maxLength} characters`,
      }));
      return false;
    }

    // Custom validator
    if (validator) {
      const customError = validator(value);
      if (customError) {
        setErrors((prev) => ({
          ...prev,
          [name]: customError,
        }));
        return false;
      }
    }

    // Clear error for this field if validation passed
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });

    return true;
  };

  /**
   * Validate multiple fields at once
   * @returns true if all valid, false if any invalid
   */
  const validateForm = (fields: FieldConfig[]): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    for (const field of fields) {
      const { name, value, required, minLength, maxLength, validator } = field;
      const stringValue = String(value).trim();

      // Check required
      if (required && !stringValue) {
        newErrors[name] = `${name} is required`;
        isValid = false;
        continue;
      }

      // Check minLength
      if (minLength && stringValue.length < minLength) {
        newErrors[name] = `${name} must be at least ${minLength} characters`;
        isValid = false;
        continue;
      }

      // Check maxLength
      if (maxLength && stringValue.length > maxLength) {
        newErrors[name] = `${name} must be less than ${maxLength} characters`;
        isValid = false;
        continue;
      }

      // Custom validator
      if (validator) {
        const customError = validator(value);
        if (customError) {
          newErrors[name] = customError;
          isValid = false;
          continue;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    setErrors({});
  };

  /**
   * Clear a specific field's error
   */
  const clearError = (fieldName: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  /**
   * Check if a specific field has an error
   */
  const hasError = (fieldName: string): boolean => {
    return !!errors[fieldName];
  };

  /**
   * Get error message for a field
   */
  const getError = (fieldName: string): string | null => {
    return errors[fieldName] || null;
  };

  /**
   * Set custom error for a field
   */
  const setError = (fieldName: string, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: message,
    }));
  };

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearError,
    hasError,
    getError,
    setError,
  };
}

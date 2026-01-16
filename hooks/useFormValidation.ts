import { useState } from "react";

/**
 * Configuration for validating a single form field
 * @property {string} name - Unique field identifier (used as key in errors object)
 * @property {string | number} value - The value to validate
 * @property {boolean} [required=false] - If true, field cannot be empty or whitespace
 * @property {number} [minLength] - Minimum character length allowed
 * @property {number} [maxLength] - Maximum character length allowed
 * @property {Function} [validator] - Custom validation function returning error message or null
 *
 * @example
 * const config: FieldConfig = {
 *   name: 'email',
 *   value: userEmail,
 *   required: true,
 *   validator: (value) => validateEmail(String(value)) ? null : 'Invalid email format'
 * };
 */
export interface FieldConfig {
  name: string;
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  validator?: (value: string | number) => string | null;
}

/**
 * Custom React hook for centralized form validation management
 *
 * Provides comprehensive form validation with support for required fields, length constraints,
 * and custom validators. Maintains error state and provides methods to validate individual fields,
 * entire forms, and manage error messages.
 *
 * @returns {Object} Validation utilities and error state
 * @returns {Record<string, string>} errors - Map of field names to error messages
 * @returns {Function} validateField - Validates a single field and updates error state
 * @returns {Function} validateForm - Validates multiple fields at once
 * @returns {Function} clearErrors - Clears all field errors
 * @returns {Function} clearError - Clears error for a specific field
 * @returns {Function} hasError - Checks if a field has an error
 * @returns {Function} getError - Gets error message for a field
 * @returns {Function} setError - Manually sets error for a field
 *
 * @example
 * // Basic form validation
 * const { errors, validateField, validateForm, hasError, getError } = useFormValidation();
 * const [email, setEmail] = useState('');
 * const [name, setName] = useState('');
 *
 * // Validate single field on blur
 * const handleEmailBlur = () => {
 *   validateField({
 *     name: 'email',
 *     value: email,
 *     required: true,
 *     validator: (value) => validateEmail(String(value)) ? null : 'Invalid email'
 *   });
 * };
 *
 * // Validate entire form on submit
 * const handleSubmit = (e: React.FormEvent) => {
 *   e.preventDefault();
 *   const isValid = validateForm([
 *     { name: 'name', value: name, required: true, minLength: 2 },
 *     { name: 'email', value: email, required: true, validator: validateEmailCustom }
 *   ]);
 *   if (isValid) submitForm();
 * };
 *
 * // Display inline errors
 * return (
 *   <input
 *     value={email}
 *     onChange={(e) => setEmail(e.target.value)}
 *     className={hasError('email') ? 'border-red-500' : ''}
 *   />
 *   {hasError('email') && <span className="text-red-500">{getError('email')}</span>}
 * );
 */
export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validates a single form field against specified constraints
   *
   * Checks field value against required, minLength, maxLength, and custom validator constraints.
   * Automatically clears error for field if validation passes.
   *
   * @param {FieldConfig} config - Field validation configuration
   * @returns {boolean} true if field passes all validations, false otherwise
   *
   * @example
   * const isValid = validateField({
   *   name: 'password',
   *   value: password,
   *   required: true,
   *   minLength: 8,
   *   validator: (val) => /[A-Z]/.test(String(val)) ? null : 'Must contain uppercase letter'
   * });
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
   * Validates multiple form fields in batch
   *
   * Validates all provided fields against their constraints and updates error state with all errors.
   * More efficient than calling validateField repeatedly for form submission validation.
   * Does NOT clear individual field errors during validation - all errors are set at once.
   *
   * @param {FieldConfig[]} fields - Array of field configurations to validate
   * @returns {boolean} true if all fields pass validation, false if any field fails
   *
   * @example
   * const isValid = validateForm([
   *   { name: 'name', value: name, required: true, minLength: 2, maxLength: 100 },
   *   { name: 'email', value: email, required: true, validator: validateEmail },
   *   { name: 'password', value: password, required: true, minLength: 8 },
   * ]);
   * if (!isValid) {
   *   console.log('Form has errors:', errors);
   * }
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
   * Clears all field errors from the error state
   *
   * Useful when resetting a form or dismissing all error messages.
   * Sets errors object to empty dictionary.
   *
   * @example
   * const handleReset = () => {
   *   setName('');
   *   setEmail('');
   *   clearErrors();
   * };
   */
  const clearErrors = () => {
    setErrors({});
  };

  /**
   * Clears the error for a specific field
   *
   * Removes the error message for a single field while keeping errors for other fields intact.
   * Useful for clearing errors as user corrects individual fields.
   *
   * @param {string} fieldName - The field identifier to clear error for
   *
   * @example
   * const handleEmailChange = (newEmail: string) => {
   *   setEmail(newEmail);
   *   clearError('email'); // Clear previous error as user types
   * };
   */
  const clearError = (fieldName: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  /**
   * Checks if a specific field currently has an error
   *
   * Returns true if field has a validation error, false if field is valid or hasn't been validated.
   *
   * @param {string} fieldName - The field identifier to check
   * @returns {boolean} true if field has an error, false otherwise
   *
   * @example
   * const emailHasError = hasError('email');
   * return (
   *   <input
   *     className={emailHasError ? 'border-red-500' : 'border-gray-300'}
   *   />
   * );
   */
  const hasError = (fieldName: string): boolean => {
    return !!errors[fieldName];
  };

  /**
   * Retrieves the error message for a specific field
   *
   * Returns the error message string if field has error, null otherwise.
   * Useful for displaying inline error messages next to form fields.
   *
   * @param {string} fieldName - The field identifier
   * @returns {string | null} Error message for field or null if no error
   *
   * @example
   * const emailError = getError('email');
   * if (emailError) {
   *   <p className="text-red-500 text-sm">{emailError}</p>
   * }
   */
  const getError = (fieldName: string): string | null => {
    return errors[fieldName] || null;
  };

  /**
   * Manually sets a custom error message for a field
   *
   * Allows setting validation errors programmatically, useful for server-side validation errors
   * or custom validation logic that runs outside normal form validation.
   *
   * @param {string} fieldName - The field identifier to set error for
   * @param {string} message - The error message to display
   *
   * @example
   * // Server-side validation error
   * try {
   *   await submitForm(formData);
   * } catch (error) {
   *   setError('email', 'This email is already registered');
   * }
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

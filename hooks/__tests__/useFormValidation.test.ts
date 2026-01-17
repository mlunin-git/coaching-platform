import { renderHook, act } from '@testing-library/react';
import { useFormValidation, FieldConfig } from '../useFormValidation';

describe('useFormValidation Hook', () => {
  describe('validateField', () => {
    it('should return false for empty required field', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        const isValid = result.current.validateField({
          name: 'email',
          value: '',
          required: true,
        });
        expect(isValid).toBe(false);
      });

      expect(result.current.hasError('email')).toBe(true);
      expect(result.current.getError('email')).toBe('email is required');
    });

    it('should return true for non-empty required field', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        const isValid = result.current.validateField({
          name: 'email',
          value: 'test@example.com',
          required: true,
        });
        expect(isValid).toBe(true);
      });

      expect(result.current.hasError('email')).toBe(false);
      expect(result.current.getError('email')).toBeNull();
    });

    it('should validate minLength constraint', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        const isValid = result.current.validateField({
          name: 'password',
          value: 'short',
          minLength: 8,
        });
        expect(isValid).toBe(false);
      });

      expect(result.current.getError('password')).toBe('password must be at least 8 characters');
    });

    it('should validate maxLength constraint', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        const isValid = result.current.validateField({
          name: 'username',
          value: 'this-is-a-very-long-username-that-exceeds-limit',
          maxLength: 20,
        });
        expect(isValid).toBe(false);
      });

      expect(result.current.getError('username')).toBe('username must be less than 20 characters');
    });

    it('should call custom validator function', () => {
      const { result } = renderHook(() => useFormValidation());
      const validator = (value: string | number) => {
        return String(value).includes('@') ? null : 'Must contain @';
      };

      act(() => {
        const isValid = result.current.validateField({
          name: 'email',
          value: 'invalid-email',
          validator,
        });
        expect(isValid).toBe(false);
      });

      expect(result.current.getError('email')).toBe('Must contain @');
    });

    it('should clear error when validation passes', () => {
      const { result } = renderHook(() => useFormValidation());

      // First validation fails
      act(() => {
        result.current.validateField({
          name: 'email',
          value: '',
          required: true,
        });
      });
      expect(result.current.hasError('email')).toBe(true);

      // Second validation passes
      act(() => {
        result.current.validateField({
          name: 'email',
          value: 'test@example.com',
        });
      });
      expect(result.current.hasError('email')).toBe(false);
    });

    it('should trim whitespace when checking required', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        const isValid = result.current.validateField({
          name: 'name',
          value: '   ',
          required: true,
        });
        expect(isValid).toBe(false);
      });
    });

    it('should handle numeric values', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        const isValid = result.current.validateField({
          name: 'age',
          value: 25,
          minLength: 1,
        });
        expect(isValid).toBe(true);
      });
    });
  });

  describe('validateForm', () => {
    it('should validate multiple fields at once', () => {
      const { result } = renderHook(() => useFormValidation());

      const fields: FieldConfig[] = [
        { name: 'email', value: '', required: true },
        { name: 'password', value: 'short', required: true, minLength: 8 },
        { name: 'name', value: 'John Doe', required: true },
      ];

      act(() => {
        const isValid = result.current.validateForm(fields);
        expect(isValid).toBe(false);
      });

      expect(result.current.hasError('email')).toBe(true);
      expect(result.current.hasError('password')).toBe(true);
      expect(result.current.hasError('name')).toBe(false);
    });

    it('should return true when all fields are valid', () => {
      const { result } = renderHook(() => useFormValidation());

      const fields: FieldConfig[] = [
        { name: 'email', value: 'test@example.com', required: true },
        { name: 'password', value: 'SecurePass123', required: true, minLength: 8 },
        { name: 'name', value: 'John Doe', required: true },
      ];

      act(() => {
        const isValid = result.current.validateForm(fields);
        expect(isValid).toBe(true);
      });

      expect(result.current.hasError('email')).toBe(false);
      expect(result.current.hasError('password')).toBe(false);
      expect(result.current.hasError('name')).toBe(false);
    });

    it('should set all errors at once', () => {
      const { result } = renderHook(() => useFormValidation());

      const fields: FieldConfig[] = [
        { name: 'email', value: '', required: true },
        { name: 'password', value: '', required: true },
      ];

      act(() => {
        result.current.validateForm(fields);
      });

      expect(Object.keys(result.current.errors).length).toBe(2);
      expect('email' in result.current.errors).toBe(true);
      expect('password' in result.current.errors).toBe(true);
    });

    it('should support custom validators in batch validation', () => {
      const { result } = renderHook(() => useFormValidation());

      const fields: FieldConfig[] = [
        {
          name: 'email',
          value: 'invalid',
          required: true,
          validator: (val) => String(val).includes('@') ? null : 'Invalid email format',
        },
      ];

      act(() => {
        result.current.validateForm(fields);
      });

      expect(result.current.getError('email')).toBe('Invalid email format');
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.setError('email', 'Error 1');
        result.current.setError('password', 'Error 2');
      });

      expect(Object.keys(result.current.errors).length).toBe(2);

      act(() => {
        result.current.clearErrors();
      });

      expect(Object.keys(result.current.errors).length).toBe(0);
      expect(result.current.errors).toEqual({});
    });
  });

  describe('clearError', () => {
    it('should clear error for specific field only', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.setError('email', 'Email error');
        result.current.setError('password', 'Password error');
      });

      act(() => {
        result.current.clearError('email');
      });

      expect(result.current.hasError('email')).toBe(false);
      expect(result.current.hasError('password')).toBe(true);
    });

    it('should not affect other errors when clearing one field', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.setError('field1', 'Error 1');
        result.current.setError('field2', 'Error 2');
        result.current.setError('field3', 'Error 3');
      });

      act(() => {
        result.current.clearError('field2');
      });

      expect(result.current.hasError('field1')).toBe(true);
      expect(result.current.hasError('field2')).toBe(false);
      expect(result.current.hasError('field3')).toBe(true);
    });
  });

  describe('hasError', () => {
    it('should return true when field has error', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.setError('email', 'Error message');
      });

      expect(result.current.hasError('email')).toBe(true);
    });

    it('should return false when field has no error', () => {
      const { result } = renderHook(() => useFormValidation());

      expect(result.current.hasError('email')).toBe(false);
    });
  });

  describe('getError', () => {
    it('should return error message for field with error', () => {
      const { result } = renderHook(() => useFormValidation());
      const errorMessage = 'This is an error';

      act(() => {
        result.current.setError('email', errorMessage);
      });

      expect(result.current.getError('email')).toBe(errorMessage);
    });

    it('should return null for field without error', () => {
      const { result } = renderHook(() => useFormValidation());

      expect(result.current.getError('email')).toBeNull();
    });
  });

  describe('setError', () => {
    it('should set custom error message', () => {
      const { result } = renderHook(() => useFormValidation());
      const customError = 'Custom error message';

      act(() => {
        result.current.setError('email', customError);
      });

      expect(result.current.getError('email')).toBe(customError);
      expect(result.current.hasError('email')).toBe(true);
    });

    it('should overwrite existing error', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.setError('email', 'Error 1');
      });

      expect(result.current.getError('email')).toBe('Error 1');

      act(() => {
        result.current.setError('email', 'Error 2');
      });

      expect(result.current.getError('email')).toBe('Error 2');
    });

    it('should allow setting errors for multiple fields', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.setError('email', 'Email error');
        result.current.setError('password', 'Password error');
        result.current.setError('name', 'Name error');
      });

      expect(result.current.getError('email')).toBe('Email error');
      expect(result.current.getError('password')).toBe('Password error');
      expect(result.current.getError('name')).toBe('Name error');
    });
  });

  describe('error state management', () => {
    it('should maintain error state across multiple operations', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.setError('field1', 'Error 1');
      });
      expect(result.current.hasError('field1')).toBe(true);

      act(() => {
        result.current.setError('field2', 'Error 2');
      });
      expect(result.current.hasError('field1')).toBe(true);
      expect(result.current.hasError('field2')).toBe(true);

      act(() => {
        result.current.clearError('field1');
      });
      expect(result.current.hasError('field1')).toBe(false);
      expect(result.current.hasError('field2')).toBe(true);
    });

    it('should expose errors object', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.setError('email', 'Email error');
        result.current.setError('password', 'Password error');
      });

      expect(result.current.errors).toEqual({
        email: 'Email error',
        password: 'Password error',
      });
    });
  });
});

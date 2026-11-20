import { useState, useCallback } from 'react';
import * as yup from 'yup';

export interface ValidationError {
  [key: string]: string;
}

export const useValidation = <T extends Record<string, any>>(schema: yup.ObjectSchema<T>) => {
  const [errors, setErrors] = useState<ValidationError>({});
  const [isValid, setIsValid] = useState(false);

  const validate = useCallback(async (data: T): Promise<boolean> => {
    try {
      await schema.validate(data, { abortEarly: false });
      setErrors({});
      setIsValid(true);
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const validationErrors: ValidationError = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
        setIsValid(false);
        return false;
      }
      setIsValid(false);
      return false;
    }
  }, [schema]);

  const validateField = useCallback(async (fieldName: string, value: any): Promise<boolean> => {
    try {
      await schema.validateAt(fieldName, { [fieldName]: value });
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error.message,
        }));
        return false;
      }
      return false;
    }
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(false);
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return errors[fieldName];
  }, [errors]);

  const hasFieldError = useCallback((fieldName: string): boolean => {
    return Boolean(errors[fieldName]);
  }, [errors]);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    isValid,
    hasErrors,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    getFieldError,
    hasFieldError,
  };
};

export default useValidation; 
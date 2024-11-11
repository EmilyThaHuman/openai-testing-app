import { useState, useCallback } from 'react';
import { z } from 'zod';

export function useFormValidation(schema) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback((data) => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error(error, { context: 'useFormValidation' });
      }
      return false;
    }
  }, [schema]);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const getFieldError = useCallback((field) => {
    return touched[field] ? errors[field] : undefined;
  }, [touched, errors]);

  return {
    errors,
    touched,
    validate,
    handleBlur,
    getFieldError,
  };
} 
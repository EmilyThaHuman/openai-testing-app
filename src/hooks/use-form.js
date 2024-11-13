import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useReactHookForm } from 'react-hook-form';

export function useForm(schema, defaultValues = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const form = useReactHookForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    setServerErrors({});

    try {
      await form.handleSubmit(async (data) => {
        await onSubmit(data);
      })();
    } catch (error) {
      setServerErrors(error.response?.data?.errors || {
        general: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form]);

  return {
    ...form,
    isSubmitting,
    serverErrors,
    handleSubmit,
  };
} 
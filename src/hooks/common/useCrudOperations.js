import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useCrudOperations = (resource, operations) => {
  const { toast } = useToast();

  const withToast = useCallback((operation, successMessage) => {
    return async (...args) => {
      try {
        const result = await operation(...args);
        toast({
          title: `${resource} ${successMessage}`,
          description: `${resource} has been ${successMessage} successfully.`
        });
        return result;
      } catch (error) {
        toast({
          title: `Failed to ${successMessage.toLowerCase()} ${resource}`,
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
    };
  }, [resource, toast]);

  return Object.entries(operations).reduce((acc, [key, operation]) => {
    const successMessages = {
      create: 'created',
      update: 'updated',
      delete: 'deleted',
      send: 'sent',
      regenerate: 'regenerated',
      submit: 'submitted'
    };

    acc[key] = withToast(operation, successMessages[key] || 'processed');
    return acc;
  }, {});
}; 
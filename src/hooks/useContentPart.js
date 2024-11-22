import { tryJsonParse } from '@/lib/utils/tryJsonParse';
import { useCallback, useState } from 'react';

export const useContentPart = (initialArgs = {}, initialResult = '') => {
  // State for managing the content part
  const [part, setPart] = useState({
    args: initialArgs,
    argsText: JSON.stringify(initialArgs, null, 2),
    result: initialResult,
  });

  // Update args and argsText together
  const updateArgs = useCallback(newArgsText => {
    setPart(prev => ({
      ...prev,
      argsText: newArgsText,
      args: tryJsonParse(newArgsText),
    }));
  }, []);

  // Update result
  const updateResult = useCallback(newResult => {
    setPart(prev => ({
      ...prev,
      result: newResult,
    }));
  }, []);

  // Reset the content part
  const reset = useCallback(() => {
    setPart({
      args: initialArgs,
      argsText: JSON.stringify(initialArgs, null, 2),
      result: initialResult,
    });
  }, [initialArgs, initialResult]);

  return {
    part,
    updateArgs,
    updateResult,
    reset,
  };
};

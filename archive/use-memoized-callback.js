import { useCallback, useRef } from 'react';

export function useMemoizedCallback(callback, deps) {
  const ref = useRef(null);
  
  return useCallback((...args) => {
    if (!ref.current) {
      ref.current = callback;
    }
    return ref.current(...args);
  }, deps);
} 
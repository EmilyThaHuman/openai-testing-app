import { useCallback } from 'react';
import { useStoreSelector } from '@/store/useStore';

export const useOpenAI = () => {
  const {
    apiKey,
    isInitialized,
    error,
    initialize,
    clearApiKey
  } = useStoreSelector(state => ({
    apiKey: state.apiKey,
    isInitialized: state.isInitialized,
    error: state.error,
    initialize: state.initialize,
    clearApiKey: state.clearApiKey
  }));

  // Memoized initialize function
  const handleInitialize = useCallback(async (key) => {
    try {
      await initialize(key);
    } catch (error) {
      console.error('Failed to initialize OpenAI:', error);
      throw error;
    }
  }, [initialize]);

  return {
    apiKey,
    isInitialized,
    error,
    initialize: handleInitialize,
    clearApiKey
  };
}; 
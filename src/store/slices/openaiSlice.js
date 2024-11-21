import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';

export const createOpenAISlice = (set, get) => ({
  // State
  apiKey: localStorage.getItem('openai_api_key') || '',
  isInitialized: false,
  error: null,
  
  // Actions
  initialize: async (key) => {
    try {
      if (!key) {
        throw new Error('API key is required');
      }

      // Initialize the OpenAI service
      UnifiedOpenAIService.initialize(key);
      
      // Save the API key
      localStorage.setItem('openai_api_key', key);
      
      set({
        apiKey: key,
        isInitialized: true,
        error: null
      });
    } catch (err) {
      set({
        error: err.message,
        isInitialized: false
      });
      throw err;
    }
  },

  clearApiKey: () => {
    localStorage.removeItem('openai_api_key');
    set({
      apiKey: '',
      isInitialized: false
    });
  },

  setError: (error) => set({ error }),

  // Selectors
  getOpenAIState: () => {
    const state = get();
    return {
      apiKey: state.apiKey,
      isInitialized: state.isInitialized,
      error: state.error
    };
  }
});

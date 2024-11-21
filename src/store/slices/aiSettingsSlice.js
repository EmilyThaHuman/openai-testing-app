import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { SUPPORTED_MODELS } from '@/constants/aiModels';

export const createAISettingsSlice = (set, get) => ({
  // Core Settings
  apiKey: localStorage.getItem('openai_api_key') || '',
  isInitialized: false,
  error: null,
  
  // Model Settings
  model: localStorage.getItem('preferred_model') || 'gpt-4-turbo-preview',
  imageModel: localStorage.getItem('image_model') || 'dall-e-3',
  temperature: parseFloat(localStorage.getItem('temperature')) || 0.7,
  maxTokens: parseInt(localStorage.getItem('max_tokens')) || 2000,
  topP: parseFloat(localStorage.getItem('top_p')) || 1,
  frequencyPenalty: parseFloat(localStorage.getItem('frequency_penalty')) || 0,
  presencePenalty: parseFloat(localStorage.getItem('presence_penalty')) || 0,
  
  // Rate Limiting
  requestsPerMinute: parseInt(localStorage.getItem('requests_per_minute')) || 50,
  tokensPerMinute: parseInt(localStorage.getItem('tokens_per_minute')) || 90000,
  
  // State
  aiSettings: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: '',
  },
  
  // Actions
  setModel: (model) => {
    if (!SUPPORTED_MODELS.includes(model)) {
      throw new Error(`Model ${model} is not supported`);
    }
    localStorage.setItem('preferred_model', model);
    set((state) => {
      state.model = model;
    });
  },

  updateModelSettings: (settings) => {
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        localStorage.setItem(key, value.toString());
        set((state) => {
          state[key] = value;
        });
      }
    });
  },

  initialize: async (key, options = {}) => {
    try {
      if (!key) {
        throw new Error('API key is required');
      }

      // Initialize service with options
      await UnifiedOpenAIService.initialize(key, {
        model: get().model,
        temperature: get().temperature,
        maxTokens: get().maxTokens,
        topP: get().topP,
        frequencyPenalty: get().frequencyPenalty,
        presencePenalty: get().presencePenalty,
        requestsPerMinute: get().requestsPerMinute,
        tokensPerMinute: get().tokensPerMinute,
        ...options
      });
      
      // Store API key securely
      localStorage.setItem('openai_api_key', key);
      
      set((state) => {
        state.apiKey = key;
        state.isInitialized = true;
        state.error = null;
      });
    } catch (err) {
      set((state) => {
        state.error = err.message;
        state.isInitialized = false;
      });
      throw err;
    }
  },

  validateSettings: () => {
    const state = get();
    const errors = [];

    if (!state.apiKey) {
      errors.push('API key is required');
    }

    if (!SUPPORTED_MODELS.includes(state.model)) {
      errors.push(`Model ${state.model} is not supported`);
    }

    if (state.temperature < 0 || state.temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (state.maxTokens < 1 || state.maxTokens > 4096) {
      errors.push('Max tokens must be between 1 and 4096');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  resetSettings: () => {
    // Clear stored settings
    [
      'openai_api_key',
      'preferred_model',
      'temperature',
      'max_tokens',
      'top_p',
      'frequency_penalty',
      'presence_penalty',
      'requests_per_minute',
      'tokens_per_minute'
    ].forEach(key => localStorage.removeItem(key));

    // Reset state
    set((state) => {
      state.apiKey = '';
      state.isInitialized = false;
      state.error = null;
      state.model = 'gpt-4-turbo-preview';
      state.temperature = 0.7;
      state.maxTokens = 2000;
      state.topP = 1;
      state.frequencyPenalty = 0;
      state.presencePenalty = 0;
      state.requestsPerMinute = 50;
      state.tokensPerMinute = 90000;
    });
  },

  getSettings: () => {
    const state = get();
    return {
      model: state.model,
      temperature: state.temperature,
      maxTokens: state.maxTokens,
      topP: state.topP,
      frequencyPenalty: state.frequencyPenalty,
      presencePenalty: state.presencePenalty,
      requestsPerMinute: state.requestsPerMinute,
      tokensPerMinute: state.tokensPerMinute
    };
  },

  updateAISettings: (settings) => {
    set((state) => ({
      aiSettings: {
        ...state.aiSettings,
        ...settings
      }
    }));
  },

  setSystemPrompt: (systemPrompt) => {
    set((state) => ({
      aiSettings: {
        ...state.aiSettings,
        systemPrompt
      }
    }));
  },

  resetAISettingsState: () => {
    set({
      aiSettings: {
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        systemPrompt: '',
      }
    });
  }
}); 
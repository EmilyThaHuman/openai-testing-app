export const createSettingsSlice = (set, get) => ({
  settings: {
    defaultModel: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2000,
    streamResponse: true,
    autoScroll: true,
    codeHighlighting: true,
    darkMode: false,
  },
  
  updateSettings: (updates) => 
    set((state) => ({
      settings: { ...state.settings, ...updates }
    })),
    
  resetSettings: () => 
    set((state) => ({
      settings: {
        defaultModel: 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 2000,
        streamResponse: true,
        autoScroll: true,
        codeHighlighting: true,
        darkMode: false,
      }
    }))
}) 
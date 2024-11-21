export const createSettingsSlice = (set, get) => ({
  settings: {
    theme: localStorage.getItem('theme') || 'system',
    fontSize: localStorage.getItem('fontSize') || 'medium',
    language: localStorage.getItem('language') || 'en',
    notifications: JSON.parse(localStorage.getItem('notifications') || 'true'),
    autoSave: JSON.parse(localStorage.getItem('autoSave') || 'true'),
    telemetry: JSON.parse(localStorage.getItem('telemetry') || 'true'),
    shortcuts: JSON.parse(localStorage.getItem('shortcuts') || '{}'),
    customPrompts: JSON.parse(localStorage.getItem('customPrompts') || '[]'),
  },
  
  updateSetting: (key, value) => {
    if (typeof value === 'undefined') return;
    
    set((state) => {
      state.settings[key] = value;
    });
    localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
  },

  updateMultipleSettings: (updates) => {
    set((state) => {
      Object.entries(updates).forEach(([key, value]) => {
        if (typeof value !== 'undefined') {
          state.settings[key] = value;
          localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
      });
    });
  },

  resetSettings: () => {
    const defaultSettings = {
      theme: 'system',
      fontSize: 'medium',
      language: 'en',
      notifications: true,
      autoSave: true,
      telemetry: true,
      shortcuts: {},
      customPrompts: []
    };

    Object.entries(defaultSettings).forEach(([key, value]) => {
      localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
    });

    set((state) => {
      state.settings = defaultSettings;
    });
  },

  addCustomPrompt: (prompt) => 
    set((state) => {
      const newPrompts = [...state.settings.customPrompts, { ...prompt, id: crypto.randomUUID() }];
      state.settings.customPrompts = newPrompts;
      localStorage.setItem('customPrompts', JSON.stringify(newPrompts));
    }),

  removeCustomPrompt: (promptId) => 
    set((state) => {
      const newPrompts = state.settings.customPrompts.filter(p => p.id !== promptId);
      state.settings.customPrompts = newPrompts;
      localStorage.setItem('customPrompts', JSON.stringify(newPrompts));
    }),

  updateShortcut: (action, keys) => 
    set((state) => {
      const newShortcuts = { ...state.settings.shortcuts, [action]: keys };
      state.settings.shortcuts = newShortcuts;
      localStorage.setItem('shortcuts', JSON.stringify(newShortcuts));
    })
}) 
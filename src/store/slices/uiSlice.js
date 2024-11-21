export const createUISlice = (set) => ({
  theme: 'system',
  settings: {
    notifications: true,
    autoSave: true,
    fontSize: 14
  },
  isSettingsOpen: false,

  setTheme: (theme) => {
    set({ theme });
  },

  updateSettings: (settings) => {
    set((state) => ({
      settings: { ...state.settings, ...settings }
    }));
  },

  toggleSettings: () => {
    set((state) => ({
      isSettingsOpen: !state.isSettingsOpen
    }));
  },

  resetUIState: () => {
    set({
      theme: 'system',
      settings: {
        notifications: true,
        autoSave: true,
        fontSize: 14
      },
      isSettingsOpen: false
    });
  }
}); 
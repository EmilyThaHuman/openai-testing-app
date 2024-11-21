export const createCommandPaletteSlice = (set, get) => ({
  // State
  isOpen: false,
  searchQuery: '',
  recentCommands: [],
  maxRecentCommands: 10,
  
  // Actions
  setIsOpen: (isOpen) => 
    set((state) => {
      state.isOpen = isOpen;
    }),

  togglePalette: () => 
    set((state) => {
      state.isOpen = !state.isOpen;
    }),

  setSearchQuery: (query) => 
    set((state) => {
      state.searchQuery = query;
    }),

  addRecentCommand: (command) => 
    set((state) => {
      // Remove if already exists
      state.recentCommands = state.recentCommands.filter(c => c.id !== command.id);
      
      // Add to start of array
      state.recentCommands.unshift({
        ...command,
        lastUsed: Date.now()
      });
      
      // Limit size
      if (state.recentCommands.length > state.maxRecentCommands) {
        state.recentCommands.pop();
      }
    }),

  clearRecentCommands: () => 
    set((state) => {
      state.recentCommands = [];
    }),

  executeCommand: async (command) => {
    try {
      await command.action();
      get().addRecentCommand(command);
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    } finally {
      get().setIsOpen(false);
    }
  },

  // Keyboard shortcut handling
  handleShortcut: (event) => {
    const state = get();
    if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      state.togglePalette();
    } else if (event.key === 'Escape' && state.isOpen) {
      event.preventDefault();
      state.setIsOpen(false);
    }
  }
}); 
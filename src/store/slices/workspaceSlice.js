import { getDefaultFiles } from '@/lib/utils/files';

export const createWorkspaceSlice = (set, get) => ({
  // State
  files: [],
  currentFile: null,
  isFileExplorerOpen: true,
  loading: false,
  error: null,

  // Actions
  initializeWorkspace: async () => {
    set({ loading: true, error: null });
    try {
      const defaultFiles = await getDefaultFiles();
      set({ 
        files: defaultFiles,
        currentFile: defaultFiles[0] || null,
        loading: false 
      });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  setCurrentFile: (file) => {
    set({ currentFile: file });
  },

  toggleFileExplorer: () => {
    set((state) => ({ isFileExplorerOpen: !state.isFileExplorerOpen }));
  },

  resetWorkspaceState: () => {
    set({
      files: [],
      currentFile: null,
      isFileExplorerOpen: true,
      loading: false,
      error: null
    });
  }
}); 
import { getDefaultFiles } from '@/lib/utils/files';

export const createOpenCanvasSlice = (set, get) => ({
  // State
  files: [],
  currentFile: null,
  isFileExplorerOpen: true,
  loading: false,
  error: null,
  content: '',
  layout: {
    chatWidth: 30,
    editorWidth: 70,
  },

  // Actions
  setFiles: files => {
    set({ files });
  },

  setCurrentFile: file => {
    set({ currentFile: file });
  },

  toggleFileExplorer: () => {
    set(state => ({
      isFileExplorerOpen: !state.isFileExplorerOpen,
    }));
  },

  setContent: content => {
    set({ content });
  },

  updateLayout: layout => {
    set(state => ({
      layout: {
        ...state.layout,
        ...layout,
      },
    }));
  },

  setLoading: loading => {
    set({ loading });
  },

  setError: error => {
    set({ error });
  },

  initializeOpenCanvas: async () => {
    set({ loading: true, error: null });
    try {
      // Initialize any required resources
      const defaultFiles = (await get().getDefaultFiles?.()) || [];
      set({
        files: defaultFiles,
        currentFile: defaultFiles[0] || null,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  // Reset state
  resetOpenCanvas: () => {
    set({
      files: [],
      currentFile: null,
      isFileExplorerOpen: true,
      loading: false,
      error: null,
      content: '',
      layout: {
        chatWidth: 30,
        editorWidth: 70,
      },
    });
  },

  addFile: async fileData => {
    const state = get();
    try {
      const newFile = {
        id: crypto.randomUUID(),
        ...fileData,
      };

      set(state => ({
        files: [...state.files, newFile],
        currentFile: newFile,
        isFileExplorerOpen: true,
      }));

      return newFile;
    } catch (error) {
      console.error('Failed to add file:', error);
      throw error;
    }
  },
});

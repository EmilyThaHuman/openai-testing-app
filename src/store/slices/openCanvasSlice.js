import { create } from 'zustand';

export const createOpenCanvasSlice = (set, get) => ({
  // UI State
  isFileExplorerOpen: false,
  isFullscreen: false,
  
  // Content State
  files: [],
  currentFile: null,
  editorContent: '',
  
  // Chat State
  messages: [],
  systemPrompt: '',
  currentThread: null,
  
  // Loading States
  loading: false,
  error: null,

  // Actions
  setIsFileExplorerOpen: (isOpen) => set({ isFileExplorerOpen: isOpen }),
  toggleFileExplorer: () => set(state => ({ isFileExplorerOpen: !state.isFileExplorerOpen })),
  
  setFiles: (files) => set({ files }),
  setCurrentFile: (file) => {
    if (file?.id !== get().currentFile?.id) {
      set({ currentFile: file });
    }
  },
  
  setEditorContent: (content) => {
    if (content !== get().editorContent) {
      set({ editorContent: content });
    }
  },

  // Initialization
  initializeWorkspace: async (defaultFiles) => {
    try {
      set({ loading: true, error: null });
      set({ 
        files: defaultFiles,
        currentFile: defaultFiles[0],
        editorContent: defaultFiles[0]?.content || ''
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Reset state
  resetOpenCanvas: () => {
    set({
      // Reset UI State
      isFileExplorerOpen: false,
      isFullscreen: false,
      
      // Reset Content State
      files: [],
      currentFile: null,
      editorContent: '',
      
      // Reset Chat State
      messages: [],
      systemPrompt: '',
      currentThread: null,
      
      // Reset Loading States
      loading: false,
      error: null
    });
  }
});

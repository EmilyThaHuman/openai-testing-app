export const createFileSlice = (set, get) => ({
  files: [],
  uploadProgress: {},
  
  setFiles: (files) => set({ files }),
  addFile: (file) => set((state) => ({ 
    files: [...state.files, file] 
  })),
  removeFile: (fileId) => set((state) => ({ 
    files: state.files.filter(f => f.id !== fileId) 
  })),
  
  setUploadProgress: (fileId, progress) => set((state) => ({
    uploadProgress: {
      ...state.uploadProgress,
      [fileId]: progress
    }
  })),
  
  clearUploadProgress: (fileId) => set((state) => {
    const newProgress = { ...state.uploadProgress }
    delete newProgress[fileId]
    return { uploadProgress: newProgress }
  }),
}) 
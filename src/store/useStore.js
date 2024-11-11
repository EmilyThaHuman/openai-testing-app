import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // API Key Management
      apiKey: null,
      setApiKey: (key) => set({ apiKey: key }),

      // Files State
      files: [],
      setFiles: (files) => set({ files }),
      addFile: (file) => set((state) => ({ files: [...state.files, file] })),
      removeFile: (fileId) => 
        set((state) => ({ files: state.files.filter(f => f.id !== fileId) })),

      // Chat State  
      chats: [],
      activeChat: null,
      setActiveChat: (chatId) => set({ activeChat: chatId }),
      addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
      
      // Loading States
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Error States  
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ apiKey: state.apiKey }),
    }
  )
) 
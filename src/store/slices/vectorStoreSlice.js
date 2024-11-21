import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";

export const createVectorStoreSlice = (set, get) => ({
  vectorStores: [],
  selectedVectorStore: null,
  vectorStoreFiles: [],
  loading: false,
  error: null,

  setVectorStores: (stores) => set({ vectorStores: stores }),
  selectVectorStore: (store) => set({ selectedVectorStore: store }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  createVectorStore: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await UnifiedOpenAIService.vectorStores.create(params);
      set((state) => ({
        vectorStores: [...state.vectorStores, response.data],
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteVectorStore: async (storeId) => {
    set({ loading: true, error: null });
    try {
      await UnifiedOpenAIService.vectorStores.delete(storeId);
      set((state) => ({
        vectorStores: state.vectorStores.filter((s) => s.id !== storeId),
        selectedVectorStore: state.selectedVectorStore?.id === storeId ? null : state.selectedVectorStore,
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchVectorStores: async () => {
    set({ loading: true, error: null });
    try {
      const response = await UnifiedOpenAIService.vectorStores.list();
      set({ vectorStores: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  addVectorStoreFile: async (vectorStoreId, params) => {
    try {
      const file_id = params.file.name;
      const response = await UnifiedOpenAIService.vectorStoreFiles.create(
        vectorStoreId,
        {
          file_id,
          chunking_strategy: params.chunking_strategy,
        }
      );
      set((state) => ({
        vectorStoreFiles: [...state.vectorStoreFiles, response],
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  removeVectorStoreFile: (fileId) =>
    set((state) => ({
      vectorStoreFiles: state.vectorStoreFiles.filter((f) => f.id !== fileId),
    })),
  clearVectorStoreFiles: () => set({ vectorStoreFiles: [] }),
  resetVectorStoreState: () => {
    set({
      vectorStores: [],
      selectedVectorStore: null,
      vectorStoreFiles: [],
      loading: false,
      error: null
    });
  }
});

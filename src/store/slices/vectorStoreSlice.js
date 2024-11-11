import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";

export const createVectorStoreSlice = (set, get) => ({
  vectorStores: [],
  selectedVectorStore: null,
  loading: false,
  error: null,

  setVectorStores: (vectorStores) => set({ vectorStores }),
  setSelectedVectorStore: (store) => set({ selectedVectorStore: store }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  createVectorStore: async (params) => {
    set({ loading: true });
    try {
      const response = await UnifiedOpenAIService.vectorStores.create(params);
      set((state) => ({
        vectorStores: [...state.vectorStores, response],
        loading: false,
      }));
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteVectorStore: async (id) => {
    set({ loading: true });
    try {
      await UnifiedOpenAIService.vectorStores.delete(id);
      set((state) => ({
        vectorStores: state.vectorStores.filter((store) => store.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchVectorStores: async () => {
    set({ loading: true });
    try {
      const response = await UnifiedOpenAIService.vectorStores.list();
      set({ vectorStores: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
});
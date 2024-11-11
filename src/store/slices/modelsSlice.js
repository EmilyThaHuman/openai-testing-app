import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";

export const createModelsSlice = (set, get) => ({
  models: [],
  availableModels: [],
  selectedModel: null,
  
  setModels: (models) => set({ models }),
  setAvailableModels: (models) => set({ availableModels: models }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  
  fetchModels: async () => {
    try {
      set({ isLoading: true });
      const response = await UnifiedOpenAIService.models.list();
      set({ 
        models: response.data,
        availableModels: response.data.filter(m => !m.disabled)
      });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  }
}) 
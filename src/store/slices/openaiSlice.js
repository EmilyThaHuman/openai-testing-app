import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";

export const createOpenAISlice = (set, get) => ({
  messages: [],
  data: null,
  result: "",
  apiKey: localStorage.getItem("openai_api_key") || "",

  setApiKey: (newApiKey) => {
    localStorage.setItem("openai_api_key", newApiKey);
    UnifiedOpenAIService.initialize(newApiKey);
    set({ apiKey: newApiKey });
  },

  sendMessage: async (content, options = {}) => {
    const userMessage = { role: "user", content };
    set((state) => ({
      messages: [...state.messages, userMessage]
    }));

    try {
      const response = await UnifiedOpenAIService.chat.create({
        model: options.model || "gpt-4",
        messages: [...get().messages, userMessage],
        ...options,
      });
      
      const assistantMessage = response.choices[0].message;
      set((state) => ({
        messages: [...state.messages, assistantMessage]
      }));
      return assistantMessage;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw error;
    }
  },

  generateImage: async (prompt, options = {}) => {
    try {
      const response = await UnifiedOpenAIService.createImage({
        prompt,
        ...options,
      });
      set({ data: response.data });
      return response.data;
    } catch (error) {
      console.error("Error in generateImage:", error);
      throw error;
    }
  },

  clearMessages: () => set({ messages: [] }),
}); 
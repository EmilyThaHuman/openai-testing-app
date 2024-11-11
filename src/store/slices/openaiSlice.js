import { toast } from "@/components/ui/use-toast";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";

export const createOpenAISlice = (set, get) => ({
  messages: [],
  data: null,
  result: "",
  isInitialized: false,
  error: null,
  loading: false,
  apiKey: "",

  initialize: () => {
    const apiKey = get().apiKey;
    if (apiKey && !get().isInitialized) {
      UnifiedOpenAIService.initialize(apiKey);
      set({ isInitialized: true });
    }
  },

  setApiKey: (newApiKey) => {
    try {
      UnifiedOpenAIService.initialize(newApiKey);
      if (typeof window !== "undefined") {
        localStorage.setItem("openai_api_key", newApiKey);
      }

      set({
        apiKey: newApiKey,
        isInitialized: true,
        error: null,
      });
      toast({
        title: "API Key Updated",
        description: "Your OpenAI API key has been successfully updated.",
      });
    } catch (error) {
      set({ error: error.message });
      toast({
        variant: "destructive",
        title: "API Key Error",
        description: error.message,
      });
    }
  },

  sendMessage: async (content, options = {}) => {
    const userMessage = { role: "user", content };

    set((state) => ({
      messages: [...state.messages, userMessage],
    }));

    try {
      const response = await UnifiedOpenAIService.chat.create({
        model: options.model || "gpt-4",
        messages: get().messages,
        ...options,
      });

      const assistantMessage = response.choices[0].message;
      set((state) => ({
        messages: [...state.messages, assistantMessage],
      }));
      return assistantMessage;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      set({ error: error.message });
      toast({
        variant: "destructive",
        title: "Message Error",
        description: error.message,
      });
      throw error;
    }
  },

  clearMessages: () => set({ messages: [] }),
});

import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import { toast } from "@/components/ui/use-toast";

const DEFAULT_CHAT_SETTINGS = {
  model: "gpt-4-turbo-preview",
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  systemPrompt: "",
  streaming: false,
};

const MODELS = {
  "gpt-4-turbo-preview": "GPT-4 Turbo",
  "gpt-4": "GPT-4",
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
};

const MODEL_DESCRIPTIONS = {
  "gpt-4-turbo-preview": "Most capable model, best for complex tasks",
  "gpt-4": "High capability, more focused on accuracy",
  "gpt-3.5-turbo": "Fast and cost-effective for simpler tasks",
};

const SETTING_DESCRIPTIONS = {
  temperature:
    "Controls randomness in responses. Higher values make output more creative but less focused.",
  maxTokens:
    "Maximum length of the response. Higher values allow longer responses but cost more.",
  topP: "Controls diversity of responses. Lower values make output more focused and deterministic.",
  frequencyPenalty: "Reduces repetition by penalizing frequently used words.",
  presencePenalty: "Encourages the model to talk about new topics.",
  systemPrompt: "Sets the behavior and role of the AI assistant.",
};

export const createChatSlice = (set, get) => ({
  chats: JSON.parse(localStorage.getItem("chats") || "[]"),
  activeChatId: null,
  isLoading: false,
  error: null,
  model: "gpt-4-turbo-preview",
  models: MODELS,
  modelDescriptions: MODEL_DESCRIPTIONS,
  chatSettings: DEFAULT_CHAT_SETTINGS,
  savedPresets: [],
  selectedPreset: DEFAULT_CHAT_SETTINGS,

  // Computed values
  activeChat: () => get().chats.find((chat) => chat.id === get().activeChatId),

  // Actions
  setModel: (model) => set({ model }),
  setActiveChatId: (id) => set({ activeChatId: id }),
  setChatSettings: (settings) => ({ settings }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  createChat: (title = "New Chat") => {
    try {
      const newChat = {
        id: Date.now().toString(),
        title,
        messages: [],
        settings: { ...DEFAULT_CHAT_SETTINGS },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        chats: [...state.chats, newChat],
        activeChatId: newChat.id,
      }));

      localStorage.setItem("chats", JSON.stringify(get().chats));

      toast({
        title: "Chat created",
        description: `New chat "${title}" has been created.`,
      });

      return newChat.id;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating chat",
        description: error.message,
      });
    }
  },

  sendMessage: async (content, options = {}) => {
    set({ isLoading: true, error: null });

    try {
      let chat = get().chats.find((c) => c.id === get().activeChatId);
      if (!chat) {
        chat = get().createChat();
      }

      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        timestamp: new Date().toISOString(),
        files: options.files || [],
      };

      // Add user message to chat immediately
      set((state) => ({
        chats: state.chats.map((c) =>
          c.id === chat.id
            ? {
                ...c,
                messages: [...c.messages, userMessage],
                updatedAt: new Date().toISOString(),
              }
            : c
        ),
      }));

      // Prepare messages array for API
      const apiMessages = [
        ...(chat.settings.systemPrompt
          ? [{ role: "system", content: chat.settings.systemPrompt.trim() }]
          : []),
        ...chat.messages,
        userMessage,
      ].map((msg) => ({
        role: msg.role,
        content: msg.content.trim(),
      }));

      if (!apiMessages.length) {
        throw new Error("No messages to send");
      }

      const isStreaming = Boolean(
        options.settings?.stream ?? chat.settings.streaming ?? false
      );

      const response = await UnifiedOpenAIService.chat.create({
        model:
          options.settings?.model ||
          chat.settings.model ||
          "gpt-4-turbo-preview",
        messages: apiMessages,
        temperature: Number(
          options.settings?.temperature ?? chat.settings.temperature ?? 0.7
        ),
        max_tokens: Number(
          options.settings?.maxTokens ?? chat.settings.maxTokens ?? 1000
        ),
        top_p: Number(options.settings?.topP ?? chat.settings.topP ?? 1),
        frequency_penalty: Number(
          options.settings?.frequencyPenalty ??
            chat.settings.frequencyPenalty ??
            0
        ),
        presence_penalty: Number(
          options.settings?.presencePenalty ??
            chat.settings.presencePenalty ??
            0
        ),
        stream: isStreaming,
      });

      if (isStreaming) {
        let streamContent = "";
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
        };

        // Add initial empty message
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chat.id
              ? {
                  ...c,
                  messages: [...c.messages, assistantMessage],
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }));

        // Process the stream
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          streamContent += content;

          // Update the message content
          set((state) => ({
            chats: state.chats.map((c) =>
              c.id === chat.id
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, content: streamContent }
                        : m
                    ),
                    updatedAt: new Date().toISOString(),
                  }
                : c
            ),
          }));
        }

        localStorage.setItem("chats", JSON.stringify(get().chats));
        return { ...assistantMessage, content: streamContent };
      } else {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.choices[0].message.content,
          timestamp: new Date().toISOString(),
        };

        // Update chat with assistant response
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chat.id
              ? {
                  ...c,
                  messages: [...c.messages, assistantMessage],
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }));

        localStorage.setItem("chats", JSON.stringify(get().chats));
        return assistantMessage;
      }
    } catch (error) {
      console.error("Chat error:", error);
      set({ error: error.message || "Failed to send message" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Additional helper methods
  clearChat: (chatId) => {
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? { ...c, messages: [], updatedAt: new Date().toISOString() }
          : c
      ),
    }));
    localStorage.setItem("chats", JSON.stringify(get().chats));
  },

  deleteChat: (chatId) => {
    set((state) => ({
      chats: state.chats.filter((c) => c.id !== chatId),
      activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
    }));
    localStorage.setItem("chats", JSON.stringify(get().chats));
  },

  updateChatTitle: (chatId, newTitle) => {
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? { ...c, title: newTitle, updatedAt: new Date().toISOString() }
          : c
      ),
    }));
    localStorage.setItem("chats", JSON.stringify(get().chats));
  },

  updateChatSettings: (chatId, newSettings) => {
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              settings: { ...c.settings, ...newSettings },
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
    }));
    localStorage.setItem("chats", JSON.stringify(get().chats));
  },

  getSettingInfo: (key) => {
    const activeChat = get().activeChat();
    return {
      label:
        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
      description: SETTING_DESCRIPTIONS[key],
      value: activeChat?.settings?.[key] ?? defaultSettings[key],
      min: key.includes("Penalty")
        ? -2
        : key === "temperature" || key === "topP"
          ? 0
          : 100,
      max: key.includes("Penalty")
        ? 2
        : key === "temperature"
          ? 2
          : key === "topP"
            ? 1
            : 4000,
      step: key === "maxTokens" ? 100 : 0.1,
    };
  },
});

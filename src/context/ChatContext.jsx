import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useOpenAI } from "./OpenAIContext";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import { useToast } from "../components/ui/use-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";

const defaultSettings = {
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

export const useChatStore = create(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,
      isLoading: false,
      error: null,
      model: "gpt-4-turbo-preview",
      models: MODELS,
      modelDescriptions: MODEL_DESCRIPTIONS,

      // Computed values
      activeChat: () =>
        get().chats.find((chat) => chat.id === get().activeChatId),

      // Actions
      setModel: (model) => set({ model }),
      setActiveChatId: (id) => set({ activeChatId: id }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      createChat: (title = "New Chat") => {
        try {
          const newChat = {
            id: Date.now().toString(),
            title,
            messages: [],
            settings: { ...defaultSettings },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            chats: [...state.chats, newChat],
            activeChatId: newChat.id,
          }));

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

      deleteChat: (chatId) => {
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== chatId),
          activeChatId:
            state.activeChatId === chatId ? null : state.activeChatId,
        }));
      },

      updateChatTitle: (chatId, newTitle) => {
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? { ...c, title: newTitle, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },

      clearChat: (chatId) => {
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? { ...c, messages: [], updatedAt: new Date().toISOString() }
              : c
          ),
        }));
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
      },

      getSettingInfo: (key) => {
        const activeChat = get().activeChat();
        return {
          label:
            key.charAt(0).toUpperCase() +
            key.slice(1).replace(/([A-Z])/g, " $1"),
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

          // Add user message immediately
          set((state) => ({
            chats: state.chats.map((c) =>
              c.id === chat.id
                ? { ...c, messages: [...c.messages, userMessage] }
                : c
            ),
          }));

          // Rest of the sendMessage implementation...
          // (Using the complete implementation from the previous response)
        } catch (error) {
          set({ error: error.message || "Failed to send message" });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        chats: state.chats,
        model: state.model,
      }),
    }
  )
);

// Helper hook for shallow equality checks
export const useChatStoreShallow = (selector) =>
  useChatStore(selector, shallow);

// Optional: Keep a simplified context for backward compatibility
export const ChatContext = React.createContext(null);

export const ChatProvider = ({ children }) => {
  return (
    <ChatContext.Provider value={useChatStore}>{children}</ChatContext.Provider>
  );
};

// Helper hook that can be used instead of direct store access
export const useChat = () => {
  const context = React.useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

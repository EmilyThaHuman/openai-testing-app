// import { create } from "zustand";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { persist } from "zustand/middleware";
import { createChatSlice } from "./slices/chatSlice";
import { createAssistantSlice } from "./slices/assistantSlice";
import { createFileSlice } from "./slices/fileSlice";
import { createUISlice } from "./slices/uiSlice";
import { createVectorStoreSlice } from "./slices/vectorStoreSlice";
import { createToolsSlice } from "./slices/toolsSlice";
import { createOpenAISlice } from "./slices/openaiSlice";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";

export const useStore = createWithEqualityFn(
  persist(
    (...args) => ({
      ...createOpenAISlice(...args),
      ...createChatSlice(...args),
      ...createAssistantSlice(...args),
      ...createFileSlice(...args),
      ...createUISlice(...args),
      ...createVectorStoreSlice(...args),
      ...createToolsSlice(...args),
      // Global state
      // apiKey: localStorage.getItem("openai_api_key") || "",

      // Helper to get all chats (both regular and assistant)
      getAllChats: () => {
        const state = args[1]();
        return [...state.chats, ...state.assistantChats].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      },

      // Helper to get active chat (either regular or assistant)
      getActiveChat: () => {
        const state = args[1]();
        return state.activeChat || state.activeAssistantChat;
      },
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        apiKey: state.apiKey,
        settings: state.settings,
        chats: state.chats,
        assistantChats: state.assistantChats,
        threads: state.threads,
        threadMessages: state.threadMessages,
        expandedThreads: Array.from(state.expandedThreads),
        assistants: state.assistants,
        selectedAssistant: state.selectedAssistant,
        vectorStores: state.vectorStores,
        selectedVectorStore: state.selectedVectorStore,
        attachedTools: state.attachedTools,
        selectedTool: state.selectedTool,
        loading: state.loading,
        error: state.error,
      }),
    }
  ),
  shallow
);

export const useStoreShallow = (selector) => useStore(selector, shallow);

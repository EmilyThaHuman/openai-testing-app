// import { create } from "zustand";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { persist } from "zustand/middleware";
import { createChatSlice } from "./slices/chatSlice";
import { createAssistantChatSlice } from "./slices/assistantChatSlice";
import { createAssistantSlice } from "./slices/assistantSlice";
import { createFileSlice } from "./slices/fileSlice";
import { createUISlice } from "./slices/uiSlice";
import { createVectorStoreSlice } from "./slices/vectorStoreSlice";
import { createToolsSlice } from "./slices/toolsSlice";
import { createOpenAISlice } from "./slices/openaiSlice";

export const useStore = createWithEqualityFn(
  persist(
    (...args) => ({
      ...createChatSlice(...args),
      ...createAssistantChatSlice(...args),
      ...createAssistantSlice(...args),
      ...createFileSlice(...args),
      ...createUISlice(...args),
      ...createVectorStoreSlice(...args),
      ...createToolsSlice(...args),
      ...createOpenAISlice(...args),
      // Global state
      apiKey: null,
      setApiKey: (key) => args[0]({ apiKey: key }),

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
        assistantThreads: state.assistantThreads,
        assistantThreadMessages: state.assistantThreadMessages,
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

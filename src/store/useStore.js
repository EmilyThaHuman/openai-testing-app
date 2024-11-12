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

      setChats: (chats) => {
        // Ensure chats is always an array
        set({ chats: Array.isArray(chats) ? chats : [] });
      },
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        // --- global state --- //
        apiKey: state.apiKey,

        // --- chat state --- //
        chatSettings: state.chatSettings,
        chats: state.chats,
        chatMessages: state.chatMessages,
        streamingChatMessages: state.streamingChatMessages,
        activeChatId: state.activeChatId,
        activeChat: state.activeChat,
        selectedChat: state.selectedChat,
        savedPresets: state.savedPresets,
        selectedPreset: state.selectedPreset,

        // --- assistant state --- //
        assistantSettings: state.assistantSettings,
        assistantChats: state.assistantChats,
        assistantChatMessages: state.assistantChatMessages,
        assistantChatMessageAttachments: state.assistantChatMessageAttachments,
        streamingAssistantChatMessages: state.streamingAssistantChatMessages,
        streamingAssistantChat: state.streamingAssistantChat,
        threads: state.threads,
        threadMessages: state.threadMessages,
        expandedThreads: Array.from(state.expandedThreads),
        assistants: state.assistants,
        selectedAssistant: state.selectedAssistant,
        selectedThread: state.selectedThread,


        // --- file state --- //
        files: state.files,
        uploadProgress: state.uploadProgress,

        // --- ui state --- //
        sidebarOpen: state.sidebarOpen,
        isCommandPaletteOpen: state.commandPaletteOpen,
        isLoading: state.isLoading,
        loading: state.loading,
        error: state.error,

        // --- vector store state --- //
        vectorStores: state.vectorStores,
        selectedVectorStore: state.selectedVectorStore,
        vectorStoreFiles: state.vectorStoreFiles,

        // --- tools state --- //
        attachedTools: state.attachedTools,
        selectedTool: state.selectedTool,
      }),
    }
  ),
  shallow
);

export const useStoreShallow = (selector) => useStore(selector, shallow);

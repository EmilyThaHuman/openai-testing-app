import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useStoreShallow } from "@/store/useStore";

export const ChatContext = React.createContext(null);

export const ChatProvider = ({ children }) => {
  const store = useStoreShallow((state) => ({
    chats: state.chats,
    activeChatId: state.activeChatId,
    isLoading: state.isLoading,
    error: state.error,
    model: state.model,
    setModel: state.setModel,
    setActiveChatId: state.setActiveChatId,
    setLoading: state.setLoading,
    setError: state.setError,
    createChat: state.createChat,
    deleteChat: state.deleteChat,
    updateChatTitle: state.updateChatTitle,
    clearChat: state.clearChat,
    updateChatSettings: state.updateChatSettings,
    getSettingInfo: state.getSettingInfo,
    sendMessage: state.sendMessage,
    activeChat: state.activeChat,
  }));

  return <ChatContext.Provider value={store}>{children}</ChatContext.Provider>;
};

// Helper hook that can be used instead of direct store access
export const useChat = () => {
  const context = React.useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

// export const useChatStore = create(
//   persist(
//     (set, get) => ({
//       chats: [],
//       activeChatId: null,
//       isLoading: false,
//       error: null,
//       model: "gpt-4-turbo-preview",
//       models: MODELS,
//       modelDescriptions: MODEL_DESCRIPTIONS,

//       // Computed values
//       activeChat: () =>
//         get().chats.find((chat) => chat.id === get().activeChatId),

//       // Actions
//       setModel: (model) => set({ model }),
//       setActiveChatId: (id) => set({ activeChatId: id }),
//       setLoading: (isLoading) => set({ isLoading }),
//       setError: (error) => set({ error }),

//       createChat: (title = "New Chat") => {
//         try {
//           const newChat = {
//             id: Date.now().toString(),
//             title,
//             messages: [],
//             settings: { ...defaultSettings },
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString(),
//           };

//           set((state) => ({
//             chats: [...state.chats, newChat],
//             activeChatId: newChat.id,
//           }));

//           toast({
//             title: "Chat created",
//             description: `New chat "${title}" has been created.`,
//           });

//           return newChat.id;
//         } catch (error) {
//           toast({
//             variant: "destructive",
//             title: "Error creating chat",
//             description: error.message,
//           });
//         }
//       },

//       deleteChat: (chatId) => {
//         set((state) => ({
//           chats: state.chats.filter((c) => c.id !== chatId),
//           activeChatId:
//             state.activeChatId === chatId ? null : state.activeChatId,
//         }));
//       },

//       updateChatTitle: (chatId, newTitle) => {
//         set((state) => ({
//           chats: state.chats.map((c) =>
//             c.id === chatId
//               ? { ...c, title: newTitle, updatedAt: new Date().toISOString() }
//               : c
//           ),
//         }));
//       },

//       clearChat: (chatId) => {
//         set((state) => ({
//           chats: state.chats.map((c) =>
//             c.id === chatId
//               ? { ...c, messages: [], updatedAt: new Date().toISOString() }
//               : c
//           ),
//         }));
//       },

//       updateChatSettings: (chatId, newSettings) => {
//         set((state) => ({
//           chats: state.chats.map((c) =>
//             c.id === chatId
//               ? {
//                   ...c,
//                   settings: { ...c.settings, ...newSettings },
//                   updatedAt: new Date().toISOString(),
//                 }
//               : c
//           ),
//         }));
//       },

//       getSettingInfo: (key) => {
//         const activeChat = get().activeChat();
//         return {
//           label:
//             key.charAt(0).toUpperCase() +
//             key.slice(1).replace(/([A-Z])/g, " $1"),
//           description: SETTING_DESCRIPTIONS[key],
//           value: activeChat?.settings?.[key] ?? defaultSettings[key],
//           min: key.includes("Penalty")
//             ? -2
//             : key === "temperature" || key === "topP"
//               ? 0
//               : 100,
//           max: key.includes("Penalty")
//             ? 2
//             : key === "temperature"
//               ? 2
//               : key === "topP"
//                 ? 1
//                 : 4000,
//           step: key === "maxTokens" ? 100 : 0.1,
//         };
//       },

//       sendMessage: async (content, options = {}) => {
//         set({ isLoading: true, error: null });

//         try {
//           let chat = get().chats.find((c) => c.id === get().activeChatId);
//           if (!chat) {
//             chat = get().createChat();
//           }

//           const userMessage = {
//             id: Date.now().toString(),
//             role: "user",
//             content: content.trim(),
//             timestamp: new Date().toISOString(),
//             files: options.files || [],
//           };

//           // Add user message immediately
//           set((state) => ({
//             chats: state.chats.map((c) =>
//               c.id === chat.id
//                 ? { ...c, messages: [...c.messages, userMessage] }
//                 : c
//             ),
//           }));

//           // Rest of the sendMessage implementation...
//           // (Using the complete implementation from the previous response)
//         } catch (error) {
//           set({ error: error.message || "Failed to send message" });
//           throw error;
//         } finally {
//           set({ isLoading: false });
//         }
//       },
//     }),
//     {
//       name: "chat-storage",
//       partialize: (state) => ({
//         chats: state.chats,
//         model: state.model,
//       }),
//     }
//   )
// );

// // Helper hook for shallow equality checks
// export const useChatStoreShallow = (selector) =>
//   useChatStore(selector, shallow);

// Optional: Keep a simplified context for backward compatibility

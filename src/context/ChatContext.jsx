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
    // State
    chats: state.chats,
    activeChat: state.activeChat,
    activeChatId: state.activeChatId,
    isLoading: state.isLoading,
    error: state.error,
    model: state.model,
    models: state.models,
    modelDescriptions: state.modelDescriptions,
    // Setters
    setModel: state.setModel,
    setActiveChatId: state.setActiveChatId,
    setActiveChat: state.setActiveChat,
    setChats: state.setChats,
    setLoading: state.setLoading,
    setError: state.setError,
    // Actions
    createChat: state.createChat,
    deleteChat: state.deleteChat,
    updateChatTitle: state.updateChatTitle,
    clearChat: state.clearChat,
    updateChatSettings: state.updateChatSettings,
    getSettingInfo: state.getSettingInfo,
    sendMessage: state.sendChatMessage,
    loadChatsFromCache: state.loadChatsFromCache,
    addMessage: state.addMessage,
  }));

  // Initialize chat state
  React.useEffect(() => {
    store.loadChatsFromCache();
  }, []);

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

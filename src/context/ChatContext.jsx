import React, { useEffect } from "react";
import { useStoreSelector } from "@/store/useStore";

export const ChatContext = React.createContext(null);

export const ChatProvider = ({ children }) => {
  const chatState = useStoreSelector((state) => ({
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

  useEffect(() => {
    chatState.loadChatsFromCache();
  }, [chatState.loadChatsFromCache]);

  return (
    <ChatContext.Provider value={chatState}>{children}</ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = React.useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

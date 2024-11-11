import { produce } from 'immer';

export const createChatSlice = (set, get) => ({
  chats: [],
  activeChat: null,
  chatSettings: {},
  messageQueue: [],
  streamingMessages: {},
  
  setActiveChat: (chatId) => 
    set(produce((state) => {
      state.activeChat = state.chats.find(chat => chat.id === chatId) || null;
    })),

  addChat: (chat) =>
    set(produce((state) => {
      state.chats.unshift(chat);
      state.activeChat = chat;
    })),

  updateChat: (chatId, updates) =>
    set(produce((state) => {
      const chatIndex = state.chats.findIndex(c => c.id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex] = { ...state.chats[chatIndex], ...updates };
        if (state.activeChat?.id === chatId) {
          state.activeChat = state.chats[chatIndex];
        }
      }
    })),

  addMessage: (chatId, message) =>
    set(produce((state) => {
      const chat = state.chats.find(c => c.id === chatId);
      if (chat) {
        if (!chat.messages) chat.messages = [];
        chat.messages.push(message);
        
        // Update last message preview
        chat.lastMessage = message.content;
        chat.lastMessageAt = new Date().toISOString();
      }
    })),

  updateStreamingMessage: (chatId, messageId, content) =>
    set(produce((state) => {
      state.streamingMessages[messageId] = content;
    })),

  clearStreamingMessage: (messageId) =>
    set(produce((state) => {
      delete state.streamingMessages[messageId];
    })),

  // Queue management for handling multiple messages
  queueMessage: (message) =>
    set(produce((state) => {
      state.messageQueue.push(message);
    })),

  dequeueMessage: () =>
    set(produce((state) => {
      state.messageQueue.shift();
    })),
}); 
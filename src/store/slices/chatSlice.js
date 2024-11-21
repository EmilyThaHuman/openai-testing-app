import { chatService } from '@/services/openai/chatService';

export const createChatSlice = (set, get) => ({
  // State
  currentThread: null,
  messages: [],
  isLoading: false,
  error: null,
  systemPrompt: '',
  messageInput: '',

  // Actions
  setCurrentThread: (thread) => set({ currentThread: thread }),
  setMessages: (messages) => set({ messages }),
  setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
  setMessageInput: (input) => set({ messageInput: input }),
  
  initializeChat: async () => {
    try {
      set({ isLoading: true });
      const thread = await chatService.createThread();
      set({ currentThread: thread });
      return thread;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loadMessages: async (threadId) => {
    try {
      set({ isLoading: true });
      const messages = await chatService.getMessages(threadId);
      set({ messages });
      return messages;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (message, currentFile = null) => {
    const state = get();
    if (!state.currentThread?.id) return;

    try {
      set({ isLoading: true });
      
      // Add optimistic message
      const optimisticMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      set({ messages: [...state.messages, optimisticMessage] });

      // Send message and get updated messages
      const messages = await chatService.sendMessage(
        state.currentThread.id,
        message,
        [], // fileIds
        {
          file_id: currentFile?.id,
          file_name: currentFile?.name,
          system_prompt: state.systemPrompt
        }
      );

      set({ messages });
      set({ messageInput: '' });
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearMessages: () => set({ messages: [] }),
  clearError: () => set({ error: null })
});

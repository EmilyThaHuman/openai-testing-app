import { chatService } from '@/services/openai/chatService';

const OPENAI_ASSISTANT_ID = import.meta.env.VITE_OPENAI_ASSISTANT_ID;
const OPENAI_THREAD_ID = import.meta.env.VITE_OPENAI_THREAD_ID;

export const createOpenCanvasChatSlice = (set, get) => ({
  // State
  currentThread: null,
  messages: [],
  isLoading: false,
  error: null,
  systemPrompt: '',
  messageInput: '',
  streamingContent: '',
  isStreaming: false,

  // Actions
  setCurrentThread: (thread) => set({ currentThread: thread }),
  setMessages: (messages) => set({ messages }),
  setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
  setMessageInput: (input) => set({ messageInput: input }),
  setStreamingContent: (content) => set({ streamingContent: content }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  
  // Initialize chat
  initializeOpenCanvasChat: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Use existing thread if available
      if (OPENAI_THREAD_ID) {
        const thread = { id: OPENAI_THREAD_ID };
        set({ currentThread: thread });
        return thread;
      }

      // Create new thread if no ID provided
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

  // Load messages
  loadOpenCanvasMessages: async (threadId = OPENAI_THREAD_ID) => {
    try {
      set({ isLoading: true, error: null });
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

  // Send message
  sendOpenCanvasMessage: async (message, currentFile = null) => {
    const state = get();
    const threadId = state.currentThread?.id || OPENAI_THREAD_ID;
    if (!threadId) return;

    try {
      set({ isLoading: true, error: null });
      
      // Add optimistic message
      const optimisticMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      set({ messages: [...state.messages, optimisticMessage] });

      // Start streaming
      set({ isStreaming: true });
      
      // Send message and get updated messages
      const messages = await chatService.sendMessage(
        threadId,
        message,
        [], // fileIds
        {
          assistant_id: OPENAI_ASSISTANT_ID,
          file_id: currentFile?.id,
          file_name: currentFile?.name,
          file_content: currentFile?.content,
          system_prompt: state.systemPrompt
        }
      );

      set({ 
        messages,
        messageInput: '',
        streamingContent: '',
        isStreaming: false
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false, isStreaming: false });
    }
  },

  // Handle streaming
  handleOpenCanvasStream: (content) => {
    set((state) => ({
      streamingContent: state.streamingContent + content
    }));
  },

  // Clear chat
  clearOpenCanvasChat: () => set({
    messages: [],
    streamingContent: '',
    isStreaming: false,
    error: null
  }),

  // Reset state
  resetOpenCanvasChat: () => set({
    currentThread: OPENAI_THREAD_ID ? { id: OPENAI_THREAD_ID } : null,
    messages: [],
    isLoading: false,
    error: null,
    systemPrompt: '',
    messageInput: '',
    streamingContent: '',
    isStreaming: false
  })
}); 
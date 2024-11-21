import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { processStreamingResponse } from '@/lib/utils/streaming';

export const createChatSlice = (set, get) => ({
  // State
  chats: [],
  activeChat: null,
  messages: [],
  isStreaming: false,

  setMessages: messages => set({ messages }),

  // Actions
  createChat: () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set(state => ({
      chats: [newChat, ...state.chats],
      activeChat: newChat,
      messages: [],
    }));
    return newChat;
  },

  setActiveChat: chatId => {
    const chat = get().chats.find(c => c.id === chatId);
    if (chat) {
      set({
        activeChat: chat,
        messages: chat.messages || [],
      });
    }
  },

  sendMessage: async content => {
    const message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    set(state => ({
      messages: [...state.messages, message],
      isStreaming: true,
    }));

    try {
      const stream = await UnifiedOpenAIService.chat.streamCompletion({
        messages: [...get().messages, message],
      });

      let assistantResponse = '';

      await processStreamingResponse(stream, chunk => {
        assistantResponse += chunk;
        set(state => ({
          messages: [
            ...state.messages,
            {
              id: 'streaming',
              role: 'assistant',
              content: assistantResponse,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      });

      // Update with final message
      set(state => ({
        messages: [
          ...state.messages.filter(m => m.id !== 'streaming'),
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: assistantResponse,
            timestamp: new Date().toISOString(),
          },
        ],
        isStreaming: false,
      }));

      // Update chat
      const chat = get().activeChat;
      if (chat) {
        set(state => ({
          chats: state.chats.map(c =>
            c.id === chat.id
              ? {
                  ...c,
                  messages: get().messages,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }));
      }
    } catch (error) {
      set({ isStreaming: false });
      throw error;
    }
  },

  resetChatState: () => {
    set({
      chats: [],
      activeChat: null,
      messages: [],
      isStreaming: false,
    });
  },
});

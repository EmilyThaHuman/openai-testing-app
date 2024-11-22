import { toast } from '@/components/ui/use-toast';
import { CACHE_KEYS, cacheService } from '@/services/cache/CacheService';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';

export const MODELS = {
  'gpt-4-turbo-preview': 'GPT-4 Turbo',
  'gpt-4': 'GPT-4',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo',
};

export const TOOLS = {
  code_interpreter: 'Code Interpreter',
  retrieval: 'File Search & Retrieval',
  function: 'Function Calling',
};

export const DEFAULT_ASSISTANT = {
  name: '',
  instructions: '',
  model: 'gpt-4-turbo-preview',
  metadata: {},
  temperature: 0.7,
  top_p: 1,
  presence_penalty: 0,
  frequency_penalty: 0,
  response_format: { type: 'text' },
  file_ids: [],
  file_search_enabled: false,
  code_interpreter_enabled: false,
  tools: [],
  function_calling_enabled: false,
  streaming: false,
};

export const createAssistantSlice = (set, get) => ({
  // State
  assistants: [],
  assistantChats: [],
  assistantChatMessages: [],
  assistantChatMessageAttachments: [],
  threads: {},
  threadMessages: {},
  runs: {},
  steps: {},
  assistantSettings: DEFAULT_ASSISTANT,
  selectedAssistant: null,
  selectedThread: null,
  expandedThreads: new Set(),
  runningThreads: new Set(),
  streaming: false,
  streamingAssistantChatMessages: [],
  streamingAssistantChat: false,
  loading: false,
  error: null,

  // Computed values
  activeThread: () => {
    const state = get();
    return state.threads[state.selectedThread?.id]?.[0];
  },

  // Setters
  setAssistants: assistants => set({ assistants }),
  setAssistantChats: chats => set({ assistantChats: chats }),
  setAssistantSettings: settings => set({ assistantSettings: settings }),
  setSelectedAssistant: assistant => set({ selectedAssistant: assistant }),
  setAssistantId: assistantId => set({ assistantId }),
  setSelectedThread: thread => set({ selectedThread: thread }),
  setStreamingAssistantChat: streaming =>
    set({ streamingAssistantChat: streaming }),
  setLoadingAssistantChat: loading => set({ loadingAssistantChat: loading }),
  setErrorAssistantChat: error => set({ errorAssistantChat: error }),
  setExpandedThreads: threadIds => set({ expandedThreads: new Set(threadIds) }),
  setThreads: threads => set({ threads }),
  setThreadMessages: messages => set({ threadMessages: messages }),
  setThreadId: threadId => set({ threadId }),
  setStreamingAssistantChatMessages: messages =>
    set({ streamingAssistantChatMessages: messages }),
  setAssistantChatMessages: messages =>
    set({ assistantChatMessages: messages }),
  setLoading: loading => set({ loading }),
  setError: error => set({ error }),

  // Main assistant operations
  fetchAssistants: async (force = false) => {
    const state = get();
    if (!force) {
      const cached = cacheService.get(CACHE_KEYS.ASSISTANTS);
      if (cached) {
        state.setAssistants(cached);
        return cached;
      }
    }

    state.setLoading(true);
    try {
      const response = await UnifiedOpenAIService.assistants.list();
      const assistants = response.data;

      console.log('assistants', assistants);
      state.setAssistants(assistants);
      cacheService.set(CACHE_KEYS.ASSISTANTS, assistants);

      // Pre-fetch threads for each assistant and return the assistants array
      await Promise.all(
        assistants.map(assistant =>
          state.fetchThreadsForAssistant(assistant.id)
        )
      );

      state.setLoading(false);

      return assistants;
    } catch (error) {
      state.setError(error.message);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  fetchThreadsForAssistant: async (assistantId, force = false) => {
    const state = get();
    if (!assistantId) return;

    state.setLoading(true);
    state.setError(null);

    try {
      const cachedThreads =
        !force && cacheService.get(CACHE_KEYS.THREADS, assistantId);
      if (cachedThreads) {
        set(prevState => ({
          threads: {
            ...prevState.threads,
            [assistantId]: Array.isArray(cachedThreads) ? cachedThreads : [],
          },
        }));
        return;
      }

      const response = await UnifiedOpenAIService.threads.list(assistantId);
      const threadsData = response?.data || [];

      set(prevState => ({
        threads: {
          ...prevState.threads,
          [assistantId]: threadsData,
        },
      }));

      cacheService.set(CACHE_KEYS.THREADS, threadsData, assistantId);

      // Prefetch messages for expanded threads
      const visibleThreads = Array.from(state.expandedThreads);
      await Promise.all(
        visibleThreads.map(threadId => state.fetchMessagesForThread(threadId))
      );
    } catch (error) {
      state.setError(error.message);
      console.error('Error fetching threads:', error);
    } finally {
      state.setLoading(false);
    }
  },

  createAssistant: async assistantData => {
    const state = get();
    state.setLoading(true);

    try {
      const assistant =
        await UnifiedOpenAIService.assistants.create(assistantData);

      set(state => ({
        assistants: [...state.assistants, assistant],
      }));

      cacheService.set(CACHE_KEYS.ASSISTANTS, get().assistants);
      state.setSelectedAssistant(assistant);
      state.setAssistantId(assistant.id);
      return assistant;
    } catch (error) {
      state.setError(error.message);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  updateAssistant: async (assistantId, updateData) => {
    const state = get();
    state.setLoading(true);

    try {
      const updated = await UnifiedOpenAIService.assistants.update(
        assistantId,
        updateData
      );

      set(state => ({
        assistants: state.assistants.map(a =>
          a.id === assistantId ? updated : a
        ),
        selectedAssistant:
          state.selectedAssistant?.id === assistantId
            ? updated
            : state.selectedAssistant,
      }));

      cacheService.set(CACHE_KEYS.ASSISTANTS, get().assistants);
      return updated;
    } catch (error) {
      state.setError(error.message);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  deleteAssistant: async assistantId => {
    const state = get();
    state.setLoading(true);

    try {
      await UnifiedOpenAIService.assistants.delete(assistantId);

      set(state => ({
        assistants: state.assistants.filter(a => a.id !== assistantId),
        selectedAssistant:
          state.selectedAssistant?.id === assistantId
            ? null
            : state.selectedAssistant,
        threads: {
          ...state.threads,
          [assistantId]: undefined,
        },
      }));

      cacheService.set(CACHE_KEYS.ASSISTANTS, get().assistants);
    } catch (error) {
      state.setError(error.message);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  // Thread operations
  createThread: async (initialMessage = null) => {
    const state = get();
    const selectedAssistant = state.selectedAssistant;

    if (!selectedAssistant) {
      const error = new Error('Please select an assistant first');
      state.setError(error);
      return null;
    }

    state.setLoading(true);
    try {
      const thread = await UnifiedOpenAIService.threads.create({
        metadata: {
          assistantId: selectedAssistant.id,
          created: new Date().toISOString(),
        },
      });

      if (initialMessage) {
        await state.sendMessage(thread.id, initialMessage);
      }

      set(state => ({
        threads: {
          ...state.threads,
          [selectedAssistant.id]: [
            ...(state.threads[selectedAssistant.id] || []),
            thread,
          ],
        },
      }));

      cacheService.set(
        CACHE_KEYS.THREADS,
        get().threads[selectedAssistant.id],
        selectedAssistant.id
      );

      return thread;
    } catch (error) {
      state.setError(error);
      return null;
    } finally {
      state.setLoading(false);
    }
  },

  // Message operations
  sendMessage: async (threadId, content, options = { stream: false }) => {
    const state = get();
    if (!content?.trim() || state.loading) return null;

    state.setLoading(true);
    try {
      // Create the message
      await UnifiedOpenAIService.threads.messages.create(threadId, content);

      // Start the assistant run
      const run = await UnifiedOpenAIService.threads.runs.create(
        threadId,
        state.selectedAssistant.id,
        options
      );

      if (options.stream) {
        return run; // Return early for streaming
      }

      // Wait for completion if not streaming
      const finalRun = await state.waitForRun(threadId, run.id);

      // Refresh messages
      await state.fetchMessagesForThread(threadId, true);

      return finalRun;
    } catch (error) {
      state.setError(error);
      return null;
    } finally {
      state.setLoading(false);
    }
  },

  // Run operations
  waitForRun: async (threadId, runId, maxAttempts = 30) => {
    const state = get();
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const run = await UnifiedOpenAIService.threads.runs.retrieve(
          threadId,
          runId
        );

        if (run.status === 'completed') {
          return run;
        }

        if (['failed', 'cancelled', 'expired'].includes(run.status)) {
          throw new Error(`Run ${runId} ${run.status}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      } catch (error) {
        state.setError(error);
        throw error;
      }
    }

    throw new Error('Run timed out');
  },

  // Streaming operations
  createStreamedThreadWithMessage: async message => {
    const state = get();
    const thread = await state.createThread();
    if (thread) {
      return await state.sendMessage(thread.id, message, { stream: true });
    }
    return null;
  },

  // Regenerate functionality
  regenerateResponse: async messageId => {
    const state = get();
    const { selectedThread, selectedAssistant } = state;

    if (!selectedThread?.id || !selectedAssistant?.id) {
      toast({
        title: 'Error',
        description: 'No active conversation',
        variant: 'destructive',
      });
      return;
    }

    try {
      state.setLoading(true);
      const message = state.threadMessages[selectedThread.id]?.find(
        m => m.id === messageId
      );

      if (!message) throw new Error('Message not found');

      const run = await UnifiedOpenAIService.threads.runs.create(
        selectedThread.id,
        selectedAssistant.id,
        {
          instructions: `Please regenerate your response to the user's message: "${message.content}"`,
        }
      );

      const updatedMessages = await UnifiedOpenAIService.threads.messages.list(
        selectedThread.id
      );
      state.setAssistantChatMessages(updatedMessages.data);

      return run;
    } catch (error) {
      state.setError(error);
      toast({
        title: 'Error',
        description: 'Failed to regenerate response',
        variant: 'destructive',
      });
    } finally {
      state.setLoading(false);
    }
  },

  // Feedback functionality
  submitFeedback: async (messageId, type) => {
    const state = get();
    const { selectedThread } = state;

    if (!selectedThread?.id || !messageId) {
      toast({
        title: 'Error',
        description: 'Invalid message or thread',
        variant: 'destructive',
      });
      return;
    }

    try {
      state.setLoading(true);
      await UnifiedOpenAIService.threads.messages.feedback.create(
        selectedThread.id,
        messageId,
        {
          rating: type === 'positive' ? 'good' : 'poor',
          feedback_text:
            type === 'positive'
              ? 'This response was helpful'
              : 'This response needs improvement',
        }
      );

      toast({
        title: 'Success',
        description: 'Feedback submitted successfully',
      });

      // Update UI to show feedback
      set(state => ({
        assistantChatMessages: state.assistantChatMessages.map(msg =>
          msg.id === messageId ? { ...msg, feedback: type } : msg
        ),
      }));
    } catch (error) {
      state.setError(error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    } finally {
      state.setLoading(false);
    }
  },

  // Reset state
  resetAssistantState: () => {
    set({
      assistants: [],
      assistantChats: [],
      assistantChatMessages: [],
      assistantChatMessageAttachments: [],
      threads: {},
      threadMessages: {},
      runs: {},
      steps: {},
      assistantSettings: DEFAULT_ASSISTANT,
      selectedAssistant: null,
      selectedThread: null,
      expandedThreads: new Set(),
      runningThreads: new Set(),
      streaming: false,
      streamingAssistantChatMessages: [],
      streamingAssistantChat: false,
      loading: false,
      error: null,
    });
  },
});

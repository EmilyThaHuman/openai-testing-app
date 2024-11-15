import { toast } from "@/components/ui/use-toast";
import { CACHE_KEYS, cacheService } from "@/services/cache/CacheService";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";

export const MODELS = {
  "gpt-4-turbo-preview": "GPT-4 Turbo",
  "gpt-4": "GPT-4",
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
};

export const TOOLS = {
  code_interpreter: "Code Interpreter",
  retrieval: "File Search & Retrieval",
  function: "Function Calling",
};

export const DEFAULT_ASSISTANT = {
  name: "",
  instructions: "",
  model: "gpt-4-turbo-preview",
  metadata: {},
  temperature: 0.7,
  top_p: 1,
  presence_penalty: 0,
  frequency_penalty: 0,
  response_format: { type: "text" },
  file_ids: [],
  file_search_enabled: false,
  code_interpreter_enabled: false,
  tools: [],
  function_calling_enabled: false,
  streaming: false,
};

export const createAssistantSlice = (set, get) => ({
  // --- State --- //
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

  // --- Computed values --- //
  activeThread: () => {
    const state = get();
    return state.threads[state.selectedAssistant?.id]?.[0];
  },

  // --- Setters --- //
  setAssistants: (assistants) => set({ assistants }),
  setAssistantChats: (chats) => set({ assistantChats: chats }),
  setAssistantSettings: (settings) => set({ assistantSettings: settings }),
  setSelectedAssistant: (assistant) => set({ selectedAssistant: assistant }),
  setAssistantId: (assistantId) => set({ assistantId }),
  setSelectedThread: (thread) => set({ selectedThread: thread }),
  setStreamingAssistantChat: (streaming) =>
    set({ streamingAssistantChat: streaming }),
  setLoadingAssistantChat: (loading) => set({ loadingAssistantChat: loading }),
  setErrorAssistantChat: (error) => set({ errorAssistantChat: error }),
  setExpandedThreads: (threadIds) =>
    set({ expandedThreads: new Set(threadIds) }),
  setThreads: (threads) => set({ threads }),
  setThreadMessages: (messages) => set({ threadMessages: messages }),
  setThreadId: (threadId) => set({ threadId }),
  setStreamingAssistantChatMessages: (messages) =>
    set({ streamingAssistantChatMessages: messages }),
  setAssistantChatMessages: (messages) =>
    set({ assistantChatMessages: messages }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

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

      state.setAssistants(assistants);
      cacheService.set(CACHE_KEYS.ASSISTANTS, assistants);

      // Pre-fetch threads for each assistant
      await Promise.all(
        assistants.map((assistant) =>
          state.fetchThreadsForAssistant(assistant.id),
        ),
      );

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
        set((prevState) => ({
          threads: {
            ...prevState.threads,
            [assistantId]: Array.isArray(cachedThreads) ? cachedThreads : [],
          },
        }));
        return;
      }

      const response = await UnifiedOpenAIService.threads.list(assistantId);
      const threadsData = response?.data || [];
      console.log("threadsData", threadsData);

      set((prevState) => ({
        threads: {
          ...prevState.threads,
          [assistantId]: threadsData,
        },
      }));

      cacheService.set(CACHE_KEYS.THREADS, threadsData, assistantId);

      // Prefetch messages for expanded threads
      const visibleThreads = Array.from(state.expandedThreads);
      await Promise.all(
        visibleThreads.map((threadId) =>
          state.fetchMessagesForThread(threadId),
        ),
      );
    } catch (error) {
      state.setError(error.message);
      console.error("Error fetching threads:", error);
    } finally {
      state.setLoading(false);
    }
  },

  createAssistant: async (assistantData) => {
    const state = get();
    state.setLoading(true);

    try {
      const assistant =
        await UnifiedOpenAIService.assistants.create(assistantData);

      set((state) => ({
        assistants: [...state.assistants, assistant],
      }));

      cacheService.set(CACHE_KEYS.ASSISTANTS, get().assistants);
      state.setSelectedAssistant(assistant);
      // state.fetchThreadsForAssistant(assistant.id);
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
        updateData,
      );

      set((state) => ({
        assistants: state.assistants.map((a) =>
          a.id === assistantId ? updated : a,
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

  deleteAssistant: async (assistantId) => {
    const state = get();
    state.setLoading(true);

    try {
      await UnifiedOpenAIService.assistants.delete(assistantId);

      set((state) => ({
        assistants: state.assistants.filter((a) => a.id !== assistantId),
        selectedAssistant:
          state.selectedAssistant?.id === assistantId
            ? null
            : state.selectedAssistant,
        // Clean up related threads and messages
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

  fetchMessagesForThread: async (threadId, force = false) => {
    const state = get();
    if (
      !threadId ||
      state.loading ||
      (!force && state.threadMessages[threadId])
    ) {
      return;
    }

    state.setLoading(true);

    try {
      const messages = await fetchThreadMessages(threadId);

      set((state) => ({
        threadMessages: {
          ...state.threadMessages,
          [threadId]: messages,
        },
        error: null,
      }));

      cacheService.set(CACHE_KEYS.MESSAGES, messages, threadId);
      return messages;
    } catch (error) {
      state.setError(error);
      console.error("Error fetching messages:", error);
    } finally {
      state.setLoading(false);
    }
  },

  createThread: async (initialMessage = null) => {
    const state = get();
    const selectedAssistant = state.selectedAssistant;

    if (!selectedAssistant) {
      const error = new Error("Please select an assistant first");
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

      set((state) => ({
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
        selectedAssistant.id,
      );

      return thread;
    } catch (error) {
      state.setError(error);
      return null;
    } finally {
      state.setLoading(false);
    }
  },

  createAndRun: async (assistantId, params) => {
    const state = get();
    return await UnifiedOpenAIService.threads.runs.createAndRun(
      assistantId,
      params,
    );
  },

  createAndStreamRun: async (assistantId, params) => {
    const state = get();
    const stream = await UnifiedOpenAIService.threads.runs.createAndStreamRun(
      assistantId,
      params,
    );
    return stream;
  },

  toggleThread: (threadIds) => {
    const state = get();
    if (state.loading) return;

    const newExpanded = new Set(threadIds);
    state.setExpandedThreads(newExpanded);

    // Batch fetch messages for newly expanded threads
    Promise.all(
      Array.from(threadIds).map(async (threadId) => {
        if (!state.threadMessages[threadId]) {
          await state.fetchMessagesForThread(threadId);
        }
      }),
    ).catch(console.error);
  },

  sendMessage: async (threadId, message, options = { stream: false }) => {
    const state = get();
    if (!message?.trim() || state.loading) return null;

    state.setLoading(true);
    try {
      // Create the message
      await UnifiedOpenAIService.threads.messages.create(threadId, message);

      // Start the assistant run
      const run = await UnifiedOpenAIService.threads.runs.create(
        threadId,
        state.selectedAssistant.id,
        options,
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

  createStreamedThreadWithMessage: async (message) => {
    const state = get();
    const thread = await state.createThread();
    if (thread) {
      return await state.sendMessage(thread.id, message, { stream: true });
    }
    return null;
  },

  // Utility functions
  waitForRun: async (threadId, runId, maxAttempts = 30) => {
    const state = get();
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const run = await UnifiedOpenAIService.threads.runs.retrieve(
          threadId,
          runId,
        );

        if (run.status === "completed") {
          return run;
        }

        if (["failed", "cancelled", "expired"].includes(run.status)) {
          throw new Error(`Run ${runId} ${run.status}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      } catch (error) {
        state.setError(error);
        throw error;
      }
    }

    throw new Error("Run timed out");
  },

  deleteThread: async (threadId, assistantId) => {
    const state = get();
    state.setLoading(true);

    try {
      await UnifiedOpenAIService.threads.delete(threadId);

      set((state) => ({
        threads: {
          ...state.threads,
          [assistantId]: state.threads[assistantId]?.filter(
            (t) => t.id !== threadId,
          ),
        },
        threadMessages: {
          ...state.threadMessages,
          [threadId]: undefined,
        },
      }));
    } catch (error) {
      state.setError(error.message);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  // Message operations
  fetchThreadMessages: async (threadId, force = false) => {
    const state = get();
    const cacheKey = `${CACHE_KEYS.MESSAGES}_${threadId}`;

    if (!force && state.threadMessages[threadId]) {
      return state.threadMessages[threadId];
    }

    try {
      const response =
        await UnifiedOpenAIService.threads.messages.list(threadId);
      const messages = response.data;

      set((state) => ({
        threadMessages: {
          ...state.threadMessages,
          [threadId]: messages,
        },
      }));

      cacheService.set(cacheKey, messages);
      return messages;
    } catch (error) {
      state.setError(error.message);
      throw error;
    }
  },

  regenerate: async (threadId) => {
    const state = get();
    const message = state.threadMessages[threadId][0];
    if (!message) return;
    await state.sendMessage(threadId, message.content, { stream: true });
  },

  submitFeedback: async (messageId, type) => {
    const state = get();
    await UnifiedOpenAIService.threads.messages.submitFeedback(
      state.selectedThread.id,
      messageId,
      type,
    );
  },

  // Computed values / Selectors
  getThreads: (assistantId) => {
    const state = get();
    return state.threads[assistantId] || [];
  },

  getThreadMessages: (threadId) => {
    const state = get();
    return state.threadMessages[threadId] || [];
  },

  isThreadExpanded: (threadId) => {
    const state = get();
    return state.expandedThreads.has(threadId);
  },
});

/*
  const handleRegenerate = useCallback(
    async (message) => {
      if (!currentThread?.id || !selectedAssistant?.id) {
        toast({
          title: "Error",
          description: "No active conversation",
          variant: "destructive",
        });
        return;
      }

      try {
        // First, we'll create a new run that starts from this message
        const run = await UnifiedOpenAIService.threads.runs.create(
          currentThread.id,
          selectedAssistant.id,
          {
            instructions: `Please regenerate your response to the user's message: "${message.content}"`,
          }
        );

        // Wait for the run to complete and get updated messages
        const updatedMessages =
          await UnifiedOpenAIService.threads.messages.list(currentThread.id);

        setAssistantChatMessages(updatedMessages.data);
        return run;
      } catch (error) {
        setError(error);
        toast({
          title: "Error",
          description: "Failed to regenerate response",
          variant: "destructive",
        });
      }
    },
    [currentThread?.id, selectedAssistant?.id, toast]
  );

  const handleFeedback = useCallback(
    async (message, type) => {
      if (!currentThread?.id || !message?.id) {
        toast({
          title: "Error",
          description: "Invalid message or thread",
          variant: "destructive",
        });
        return;
      }

      try {
        // Create feedback for the message
        await UnifiedOpenAIService.threads.messages.feedback.create(
          currentThread.id,
          message.id,
          {
            rating: type === "positive" ? "good" : "poor",
            feedback_text:
              type === "positive"
                ? "This response was helpful"
                : "This response needs improvement",
          }
        );

        toast({
          title: "Success",
          description: "Feedback submitted successfully",
        });

        // Optionally, you can update the UI to show the feedback has been recorded
        setAssistantChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id ? { ...msg, feedback: type } : msg
          )
        );
      } catch (error) {
        setError(error);
        toast({
          title: "Error",
          description: "Failed to submit feedback",
          variant: "destructive",
        });
      }
    },
    [currentThread?.id, toast]
  );
*/

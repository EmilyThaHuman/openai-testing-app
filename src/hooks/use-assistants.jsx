// hooks/useAssistants.js
import { useCallback, useEffect } from "react";
import { useStoreShallow } from "@/store/useStore";
import { useToast } from "@/components/ui/use-toast";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";

export const useAssistants = () => {
  const store = useStoreShallow((state) => ({
    // Core state
    assistants: state.assistants,
    selectedAssistant: state.selectedAssistant,

    streaming: state.streaming,
    loading: state.loading,
    error: state.error,
    expandedThreads: state.expandedThreads,
    threadMessages: state.threadMessages,
    streamingAssistantChatMessages: state.streamingAssistantChatMessages,
    streamingAssistantChat: state.streamingAssistantChat,

    setLoading: state.setLoading,
    setError: state.setError,

    // Setters
    setStreaming: state.setStreaming,
    streamingChatMessages: state.streamingChatMessages,
    assistantChatMessages: state.assistantChatMessages,
    setStreamingChatMessages: state.setStreamingChatMessages,
    setAssistantChatMessages: state.setAssistantChatMessages,
    setSelectedAssistant: state.setSelectedAssistant,
    setSelectedThread: state.setSelectedThread,
    setExpandedThreads: state.setExpandedThreads,
    setAssistants: state.setAssistants,
    setThreads: state.setThreads,

    // Actions
    fetchAssistants: state.fetchAssistants,
    createAssistant: state.createAssistant,
    updateAssistant: state.updateAssistant,
    deleteAssistant: state.deleteAssistant,
    fetchThreadsForAssistant: state.fetchThreadsForAssistant,
    createThread: state.createThread,
    toggleThread: state.toggleThread,
    sendMessage: state.sendMessage,
    createStreamedThreadWithMessage: state.createStreamedThreadWithMessage,
    submitFeedback: state.submitFeedback,
    regenerateResponse: state.regenerateResponse,

    // Selectors
    getThreads: state.getThreads,
    getThreadMessages: state.getThreadMessages,
    isThreadExpanded: state.isThreadExpanded,
  }));

  const { toast } = useToast();

  const handleError = useCallback(
    (error, title) => {
      console.error(error);
      toast({
        title,
        description: error.message,
        variant: "destructive",
      });
      return null;
    },
    [toast]
  );

  const safeOperation = useCallback(
    async (operation, errorTitle) => {
      try {
        return await operation();
      } catch (error) {
        return handleError(error, errorTitle);
      }
    },
    [handleError]
  );

  const fetchAssistants = useCallback(async () => {
    store.setLoading(true);
    try {
      const response = await UnifiedOpenAIService.assistants.list();
      store.setAssistants(response.data);
    } catch (error) {
      store.setError(error);
      toast({
        title: "Error fetching assistants",
        description:
          error.message || "An error occurred while fetching assistants.",
        variant: "destructive",
      });
      console.error("Error fetching assistants:", error);
    } finally {
      store.setLoading(false);
    }
  }, [store.setAssistants, store.setLoading, store.setError, toast]);

  return {
    // Core state
    assistants: store.assistants,
    selectedAssistant: store.selectedAssistant,
    streaming: store.streaming,
    loading: store.loading,
    error: store.error,
    expandedThreads: store.expandedThreads,
    threadMessages: store.threadMessages,
    streamingAssistantChatMessages: store.streamingAssistantChatMessages,
    streamingAssistantChat: store.streamingAssistantChat,

    // Setters
    setStreaming: store.setStreaming,
    streamingChatMessages: store.streamingChatMessages,
    assistantChatMessages: store.assistantChatMessages,
    setStreamingChatMessages: store.setStreamingChatMessages,
    setAssistantChatMessages: store.setAssistantChatMessages,
    setSelectedAssistant: store.setSelectedAssistant,
    setSelectedThread: store.setSelectedThread,
    setExpandedThreads: store.setExpandedThreads,
    setAssistants: store.setAssistants,
    setThreads: store.setThreads,

    // Actions
    fetchAssistants,
    createAssistant: (data) =>
      safeOperation(
        () => store.createAssistant(data),
        "Error creating assistant"
      ),
    updateAssistant: (id, data) =>
      safeOperation(
        () => store.updateAssistant(id, data),
        "Error updating assistant"
      ),
    deleteAssistant: (id) =>
      safeOperation(
        () => store.deleteAssistant(id),
        "Error deleting assistant"
      ),
    fetchThreadsForAssistant: (force) =>
      safeOperation(
        () => store.fetchThreadsForAssistant(force),
        "Error fetching threads"
      ),
    createThread: (data) =>
      safeOperation(() => store.createThread(data), "Error creating thread"),
    toggleThread: (threadId) =>
      safeOperation(
        () => store.toggleThread(threadId),
        "Error toggling thread"
      ),
    sendMessage: (threadId, content, options) =>
      safeOperation(
        () => store.sendMessage(threadId, content, options),
        "Error sending message"
      ),
    createStreamedThreadWithMessage: (message) =>
      safeOperation(
        () => store.createStreamedThreadWithMessage(message),
        "Error creating thread with message"
      ),
    submitFeedback: (messageId, type) =>
      safeOperation(
        () => store.submitFeedback(messageId, type),
        "Error submitting feedback"
      ),
    regenerateResponse: (threadId) =>
      safeOperation(
        () => store.regenerateResponse(threadId),
        "Error regenerating message"
      ),

    // Selectors
    getThreads: store.getThreads,
    getThreadMessages: store.getThreadMessages,
    isThreadExpanded: store.isThreadExpanded,

    // Helper methods
    isLoading: store.loading,
    hasError: !!store.error,
    clearError: () => store.setError(null),
  };
};

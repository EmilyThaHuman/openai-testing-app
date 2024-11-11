// hooks/useAssistants.js
import { useCallback } from "react";
import { useStoreShallow } from "@/store/useStore";
import { useToast } from "@/components/ui/use-toast";

export const useAssistants = () => {
  const store = useStoreShallow((state) => ({
    // Core state
    assistants: state.assistants,
    selectedAssistant: state.selectedAssistant,
    streaming: state.streaming,
    loading: state.loading,
    error: state.error,
    expandedThreads: state.expandedThreads,

    // Actions
    setStreaming: state.setStreaming,
    streamingChatMessages: state.streamingChatMessages,
    assistantChatMessages: state.assistantChatMessages,
    setStreamingChatMessages: state.setStreamingChatMessages,
    setAssistantChatMessages: state.setAssistantChatMessages,
    setSelectedAssistant: state.setSelectedAssistant,
    setExpandedThreads: state.setExpandedThreads,
    fetchAssistants: state.fetchAssistants,
    createAssistant: state.createAssistant,
    updateAssistant: state.updateAssistant,
    deleteAssistant: state.deleteAssistant,
    fetchThreadsForAssistant: state.fetchThreadsForAssistant,
    createThread: state.createThread,
    toggleThread: state.toggleThread,
    sendMessage: state.sendMessage,
    createStreamedThreadWithMessage: state.createStreamedThreadWithMessage,

    // Selectors
    getAssistantThreads: state.getAssistantThreads,
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

  return {
    ...store,
    // Wrap key operations with error handling
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
    fetchAssistants: () =>
      safeOperation(store.fetchAssistants, "Error fetching assistants"),
    createAssistant: (data) =>
      safeOperation(
        () => store.createAssistant(data),
        "Error creating assistant"
      ),
    fetchThreadsForAssistant: (force) =>
      safeOperation(
        () => store.fetchThreadsForAssistant(force),
        "Error fetching threads"
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
        () => store.regenerate(threadId),
        "Error regenerating message"
      ),

    // Helper methods
    isLoading: store.loading,
    hasError: !!store.error,
    clearError: () => store.setError(null),
  };
};

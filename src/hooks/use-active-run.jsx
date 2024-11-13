import { useState, useCallback } from "react";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import useRuns from "./use-runs";

export const useActiveRun = (options = {}) => {
  const [currentThread, setCurrentThread] = useState(null);
  const [currentAssistantId, setCurrentAssistantId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  // Initialize useRuns hook with current thread and assistant
  const {
    createRun,
    cancelRun,
    submitToolOutputs,
    listSteps,
    currentRun,
    status,
    error: runError,
    requiredAction,
    toolCalls,
    isPolling,
  } = useRuns(currentThread?.id, currentAssistantId, {
    onToolExecution: options.onToolExecution,
  });

  /**
   * Create a new thread and set it as the current thread
   * @returns {Promise<Object>} The created thread
   */
  const createThread = useCallback(async (messages) => {
    try {
      const thread = await UnifiedOpenAIService.threads.create(messages);
      setCurrentThread(thread);
      return thread;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  /**
   * Add a message to the current thread
   * @param {string} message - The message content to add
   * @returns {Promise<Object>} The created message
   */
  const addMessage = useCallback(
    async (message) => {
      if (!currentThread?.id) throw new Error("No active thread");
      try {
        return await UnifiedOpenAIService.threads.messages.create(
          currentThread.id,
          message
        );
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [currentThread]
  );

  /**
   * Start a new run with an assistant
   * @param {string} assistantId - The ID of the assistant to use
   * @param {Object} params - Additional parameters
   * @param {string} params.initialMessage - Optional initial message
   * @param {Object} params.runOptions - Optional run creation options
   * @returns {Promise<Object>} The run results
   */
  const startNewRun = useCallback(
    async (assistantId, { initialMessage = null, runOptions = {} } = {}) => {
      setError(null);
      setIsRunning(true);

      // Resolve the assistant ID
      const resolvedAssistantId =
        assistantId ||
        currentAssistantId ||
        import.meta.env.VITE_OPENAI_ASSISTANT_ID;

      if (!resolvedAssistantId) {
        const errorMsg = "Assistant ID is required to start a new run.";
        setError(new Error(errorMsg));
        setIsRunning(false);
        throw new Error(errorMsg);
      }

      setCurrentAssistantId(resolvedAssistantId);

      try {
        // Create or use existing thread
        let thread = currentThread;
        if (!thread) {
          thread = await createThread();
        }

        // Add initial message if provided
        if (initialMessage) {
          await addMessage(initialMessage);
        }

        // Create and start the run
        const run = await createRun(runOptions);

        // Update the current thread state
        const updatedThread = await UnifiedOpenAIService.threads.retrieve(thread.id);
        setCurrentThread(updatedThread);

        return {
          run,
          thread: updatedThread,
          messages: updatedThread.messages,
        };
      } catch (err) {
        setError(err);
        console.error("Failed to start run:", err);
        throw err;
      } finally {
        setIsRunning(false);
      }
    },
    [currentThread, createThread, addMessage, createRun, currentAssistantId]
  );

  /**
   * Clear the current thread and reset state
   */
  const clearThread = useCallback(() => {
    setCurrentThread(null);
    setCurrentAssistantId(null);
    setError(null);
    setIsRunning(false);
  }, []);

  /**
   * Get messages for the current thread
   * @returns {Promise<Array>} Array of messages
   */
  const getMessages = useCallback(async () => {
    if (!currentThread?.id) return [];
    try {
      const response = await UnifiedOpenAIService.threads.messages.list(
        currentThread.id
      );
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [currentThread]);

  /**
   * Submit a new message and start a run
   * @param {string} message - The message to submit
   * @param {Object} runOptions - Optional run creation options
   * @returns {Promise<Object>} The run results
   */
  const submitMessage = useCallback(
    async (message, runOptions = {}) => {
      try {
        return await startNewRun(currentAssistantId, {
          initialMessage: message,
          runOptions,
        });
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [currentAssistantId, startNewRun]
  );

  return {
    // Core run management
    startNewRun,
    cancelRun,
    clearThread,
    submitMessage,

    // Tool and function handling
    submitToolOutputs,
    requiredAction,
    toolCalls,

    // Thread management
    currentThread,
    getMessages,

    // Run information
    currentRun,
    currentAssistantId,
    listSteps,

    // Status and error handling
    isRunning,
    isPolling,
    status,
    error: error || runError,
  };
};

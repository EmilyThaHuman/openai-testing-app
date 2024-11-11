import { CACHE_KEYS, cacheService } from "@/services/cache/CacheService";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import { useState, useEffect, useCallback } from "react";

const POLLING_INTERVAL = 1000; // 1 second

/**
 * Custom hook for managing OpenAI Assistant runs using UnifiedOpenAIService
 * @param {string} threadId - The ID of the thread to create runs for
 * @param {string} assistantId - The ID of the assistant to use for runs
 * @param {Object} options - Additional options for the hook
 * @param {Function} options.onToolExecution - Callback for when tools need to be executed
 * @returns {Object} Run management methods and state
 */
const useRuns = (threadId, assistantId, options = {}) => {
  const [currentRun, setCurrentRun] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");
  const [requiredAction, setRequiredAction] = useState(null);
  const [toolCalls, setToolCalls] = useState([]);

  /**
   * Handle required actions from the run
   * @param {Object} run - The run object to check for required actions
   */
  const handleRequiredAction = useCallback(
    async (run) => {
      if (run.required_action?.type === "submit_tool_outputs") {
        setRequiredAction(run.required_action);
        setToolCalls(run.required_action.submit_tool_outputs.tool_calls);

        if (options.onToolExecution) {
          const toolOutputs = await options.onToolExecution(
            run.required_action.submit_tool_outputs.tool_calls
          );
          if (toolOutputs) {
            await submitToolOutputs(toolOutputs);
          }
        }
      } else {
        setRequiredAction(null);
        setToolCalls([]);
      }
    },
    [options.onToolExecution]
  );

  /**
   * Create a new run and monitor its status
   * @param {Object} runOptions - Optional parameters for run creation
   * @returns {Promise<Object>} The completed run object
   */
  const createRun = useCallback(
    async (runOptions = {}) => {
      try {
        setStatus("creating");
        setError(null);
        setRequiredAction(null);
        setToolCalls([]);

        if (!threadId) {
          // create a new thread
          const thread = await UnifiedOpenAIService.threads.create();
          threadId = thread.id;
        }

        if (!assistantId) {
          assistantId = import.meta.env.VITE_OPENAI_ASSISTANT_ID;
        }

        // Create a new run using the UnifiedOpenAIService
        const run = await UnifiedOpenAIService.threads.runs.create(
          threadId,
          assistantId,
          runOptions
        );

        cacheService.set(CACHE_KEYS.RUNS, run, threadId);

        setCurrentRun(run);

        // Check for required actions
        await handleRequiredAction(run);

        // Update status based on run completion
        if (
          ["completed", "failed", "cancelled", "expired"].includes(run.status)
        ) {
          setStatus(run.status);
        } else {
          setStatus("polling");
        }

        return run;
      } catch (err) {
        setError(err);
        setStatus("error");
        throw err;
      }
    },
    [threadId, assistantId, handleRequiredAction]
  );

  /**
   * Retrieve the current status of a run
   * @param {string} runId - The ID of the run to check
   * @returns {Promise<Object>} The updated run object
   */
  const retrieveRun = useCallback(
    async (runId) => {
      try {
        const run = await UnifiedOpenAIService.threads.runs.get(
          threadId,
          runId
        );
        setCurrentRun(run);
        await handleRequiredAction(run);
        return run;
      } catch (err) {
        setError(err);
        setStatus("error");
        throw err;
      }
    },
    [threadId, handleRequiredAction]
  );

  /**
   * Submit tool outputs for a run
   * @param {Array} toolOutputs - Array of tool outputs to submit
   * @returns {Promise<Object>} The updated run object
   */
  const submitToolOutputs = useCallback(
    async (toolOutputs) => {
      if (!currentRun?.id) return;

      try {
        const updatedRun =
          await UnifiedOpenAIService.threads.runs.submitToolOutputs(
            threadId,
            currentRun.id,
            { tool_outputs: toolOutputs }
          );

        setCurrentRun(updatedRun);
        setRequiredAction(null);
        setToolCalls([]);

        // Check for any new required actions
        await handleRequiredAction(updatedRun);

        return updatedRun;
      } catch (err) {
        setError(err);
        setStatus("error");
        throw err;
      }
    },
    [currentRun, threadId, handleRequiredAction]
  );

  /**
   * Cancel the current run
   * @returns {Promise<Object>} The cancelled run object
   */
  const cancelRun = useCallback(async () => {
    if (!currentRun?.id) return;

    try {
      setStatus("cancelling");
      const cancelledRun = await UnifiedOpenAIService.threads.runs.cancel(
        threadId,
        currentRun.id
      );

      setCurrentRun(cancelledRun);
      setStatus("cancelled");
      setIsPolling(false);
      setRequiredAction(null);
      setToolCalls([]);
      return cancelledRun;
    } catch (err) {
      setError(err);
      setStatus("error");
      throw err;
    }
  }, [currentRun, threadId]);

  /**
   * List steps for the current run
   * @returns {Promise<Array>} Array of run steps
   */
  const listSteps = useCallback(async () => {
    if (!currentRun?.id) return [];

    try {
      const { data } = await UnifiedOpenAIService.threads.runs.steps.list(
        threadId,
        currentRun.id
      );
      return data;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [currentRun, threadId]);

  // Poll for run status updates
  useEffect(() => {
    let pollInterval;

    const pollRunStatus = async () => {
      if (!currentRun?.id || !isPolling) return;

      try {
        const run = await retrieveRun(currentRun.id);

        if (
          ["completed", "failed", "cancelled", "expired"].includes(run.status)
        ) {
          setIsPolling(false);
          setStatus(run.status);
        }
      } catch (err) {
        setIsPolling(false);
        setError(err);
        setStatus("error");
      }
    };

    if (isPolling) {
      pollInterval = setInterval(pollRunStatus, POLLING_INTERVAL);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [currentRun, isPolling, retrieveRun]);

  // Start polling when a run is created
  useEffect(() => {
    if (status === "polling" && currentRun?.id) {
      setIsPolling(true);
    }
  }, [status, currentRun]);

  return {
    createRun,
    cancelRun,
    submitToolOutputs,
    listSteps,
    currentRun,
    status,
    error,
    isPolling,
    requiredAction,
    toolCalls,
  };
};

export default useRuns;

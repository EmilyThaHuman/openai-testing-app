// useThreads.js
import { useState, useCallback, useEffect } from "react";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import { CACHE_KEYS, cacheService } from "@/services/cache/CacheService";
import { useToast } from "@/components/ui/use-toast";
import { fetchThreads, fetchThreadMessages } from "@/utils/openAIUtils";

export function useThreads(selectedAssistant) {
  const [threads, setThreads] = useState(
    () => cacheService.get(CACHE_KEYS.THREADS) || []
  );
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedThreads, setExpandedThreads] = useState(new Set());
  const [threadMessages, setThreadMessages] = useState(
    () => cacheService.get(CACHE_KEYS.MESSAGES) || {}
  );
  const { toast } = useToast();

  useEffect(() => {
    if (selectedAssistant) {
      fetchThreadsForAssistant();
    }
  }, [selectedAssistant]);

  const fetchThreadsForAssistant = useCallback(
    async (force = false) => {
      if (!selectedAssistant?.id) {
        setThreads([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const cachedThreads =
          !force && cacheService.get(CACHE_KEYS.THREADS, selectedAssistant.id);
        if (cachedThreads) {
          setThreads(Array.isArray(cachedThreads) ? cachedThreads : []);
          return;
        }

        const response = await UnifiedOpenAIService.threads.list(
          selectedAssistant.id
        );
        const threadsData = response?.data || [];
        setThreads(threadsData);
        cacheService.set(CACHE_KEYS.THREADS, threadsData, selectedAssistant.id);
      } catch (error) {
        console.error("Error fetching threads:", error);
        setError(error);
        setThreads([]);
        toast({
          title: "Error fetching threads",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedAssistant, toast]
  );

  const fetchMessagesForThread = useCallback(
    async (threadId, force = false) => {
      await fetchThreadMessages(
        threadId,
        setThreadMessages,
        CACHE_KEYS.MESSAGES,
        toast,
        force
      );
    },
    [setThreadMessages, toast]
  );

  const createThread = useCallback(async () => {
    if (!selectedAssistant) {
      toast({
        title: "Error",
        description: "Please select an assistant first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const thread = await UnifiedOpenAIService.threads.create({
        metadata: {
          assistantId: selectedAssistant.id,
          created: new Date().toISOString(),
        },
      });

      setThreads((prev) => {
        const updated = [...prev, thread];
        cacheService.set(CACHE_KEYS.THREADS, updated);
        return updated;
      });

      return thread;
    } catch (error) {
      toast({
        title: "Error creating thread",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedAssistant, toast]);

  const deleteThread = useCallback(
    async (threadId) => {
      setLoading(true);
      try {
        await UnifiedOpenAIService.threads.del(threadId);

        setThreads((prev) => {
          const updated = prev.filter((thread) => thread.id !== threadId);
          cacheService.set(CACHE_KEYS.THREADS, updated);
          return updated;
        });

        cacheService.remove(CACHE_KEYS.MESSAGES, threadId);
        setThreadMessages((prev) => {
          const updated = { ...prev };
          delete updated[threadId];
          return updated;
        });

        toast({
          title: "Success",
          description: "Thread deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error deleting thread",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const toggleThread = useCallback(
    (threadIds) => {
      const newExpanded = new Set(threadIds);
      setExpandedThreads(newExpanded);

      threadIds.forEach((threadId) => {
        if (!threadMessages[threadId]) {
          fetchMessagesForThread(threadId);
        }
      });
    },
    [threadMessages, fetchMessagesForThread]
  );

  const sendMessage = useCallback(
    async (threadId, message, options = { stream: false }) => {
      if (!message?.trim() || loading) return;

      setLoading(true);
      try {
        await UnifiedOpenAIService.threads.messages.create(threadId, message);

        const run = await UnifiedOpenAIService.threads.runs.create(
          threadId,
          selectedAssistant.id,
          options
        );

        cacheService.remove(CACHE_KEYS.MESSAGES, threadId);
        await fetchMessagesForThread(threadId, true);

        return run;
      } catch (error) {
        toast({
          title: "Error sending message",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedAssistant, loading, fetchMessagesForThread, toast]
  );

  const createThreadWithMessage = useCallback(
    async (message) => {
      const thread = await createThread();
      if (thread) {
        await sendMessage(thread.id, message);
      }
    },
    [createThread, sendMessage]
  );

  const createStreamedThreadWithMessage = useCallback(
    async (message) => {
      const thread = await createThread();
      if (thread) {
        await sendMessage(thread.id, message, { stream: true });
      }
    },
    [createThread, sendMessage]
  );
  return {
    threads,
    expandedThreads,
    threadMessages,
    loading,
    error,
    selectedThread,
    setSelectedThread,
    fetchThreads: fetchThreadsForAssistant,
    fetchThreadMessages: fetchMessagesForThread,
    createThread,
    deleteThread,
    toggleThread,
    sendMessage,
    createThreadWithMessage,
    createStreamedThreadWithMessage,
  };
}

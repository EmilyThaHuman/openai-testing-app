// useAssistants.js
import { useState, useEffect } from "react";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import { CACHE_KEYS, cacheService } from "@/services/cache/CacheService";
import { useToast } from "@/components/ui/use-toast";
import { fetchThreads, fetchThreadMessages } from "@/utils/openAIUtils";

export function useAssistants(apiKey) {
  const [assistants, setAssistants] = useState(
    () => cacheService.get(CACHE_KEYS.ASSISTANTS) || []
  );
  const [selectedAssistant, setSelectedAssistant] = useState(null);

  const [assistantIds, setAssistantIds] = useState([]);
  const [assistantThreads, setAssistantThreads] = useState({});
  const [assistantThreadMessages, setAssistantThreadMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchAssistants = async () => {
    setLoading(true);
    try {
      const response = await UnifiedOpenAIService.assistants.list();
      setAssistants(response.data);
      cacheService.set(CACHE_KEYS.ASSISTANTS, response.data);

      const newAssistantIds = response.data.map((assistant) => assistant.id);
      setAssistantIds(newAssistantIds);

      // Fetch threads and messages for all assistants
      await Promise.all(
        newAssistantIds.map((assistantId) => fetchAssistantData(assistantId))
      );
    } catch (error) {
      setError(error);
      toast({
        title: "Error fetching assistants",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssistantData = async (assistantId) => {
    try {
      await fetchThreads(
        assistantId,
        (threads) =>
          setAssistantThreads((prev) => ({ ...prev, [assistantId]: threads })),
        CACHE_KEYS.THREADS,
        toast
      );

      const threads = assistantThreads[assistantId] || [];
      await Promise.all(
        threads?.map((thread) =>
          fetchThreadMessages(
            thread.id,
            setAssistantThreadMessages,
            CACHE_KEYS.MESSAGES,
            toast
          )
        )
      );
    } catch (error) {
      setError(error);
      toast({
        title: "Error fetching assistant data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (apiKey) {
      UnifiedOpenAIService.initialize(apiKey);
      fetchAssistants();
    }
  }, [apiKey]);

  return {
    assistants,
    assistantThreads,
    assistantThreadMessages,
    loading,
    error,
    selectedAssistant,
    setSelectedAssistant,
  };
}

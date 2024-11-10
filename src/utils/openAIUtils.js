// openAIUtils.js
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import { cacheService } from "@/services/cache/CacheService";

export async function fetchThreads(
  assistantId,
  setThreads,
  cacheKey,
  toast,
  force = false
) {
  if (!force) {
    const cached = cacheService.get(cacheKey);
    if (cached) {
      setThreads(cached);
      return;
    }
  }

  try {
    const response = await UnifiedOpenAIService.threads.list(assistantId);
    setThreads(response.data);
    cacheService.set(cacheKey, response.data);
  } catch (error) {
    toast({
      title: "Error fetching threads",
      description: error.message,
      variant: "destructive",
    });
  }
}

export async function fetchThreadMessages(
  threadId,
  setThreadMessages,
  cacheKey,
  toast,
  force = false
) {
  if (!force) {
    const cached = cacheService.get(cacheKey, threadId);
    if (cached) {
      setThreadMessages((prev) => ({
        ...prev,
        [threadId]: cached,
      }));
      return;
    }
  }

  try {
    const response = await UnifiedOpenAIService.messages.list(threadId);
    setThreadMessages((prev) => {
      const updated = {
        ...prev,
        [threadId]: response.data,
      };
      cacheService.set(cacheKey, response.data, threadId);
      return updated;
    });
  } catch (error) {
    toast({
      title: "Error fetching messages",
      description: `Failed to load messages for thread: ${error.message}`,
      variant: "destructive",
    });
  }
}

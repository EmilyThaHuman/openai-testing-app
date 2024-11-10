import { UnifiedOpenAIService } from "./unifiedOpenAIService";

export const CustomOpenAIService = {
  getAssistantThreads: async (assistantId) => {
    try {
      // Get all threads
      const threads = [];
      let threadsResponse = await UnifiedOpenAIService.threads.list();
      threads.push(...threadsResponse.data);

      // Handle pagination if there are more threads
      while (threadsResponse.has_more) {
        threadsResponse = await UnifiedOpenAIService.threads.list({
          after: threadsResponse.last_id,
        });
        threads.push(...threadsResponse.data);
      }

      // Filter threads to only include those that have runs with this assistant
      const threadsWithRuns = await Promise.all(
        threads?.map(async (thread) => {
          try {
            // Get runs for this thread
            const runs = await UnifiedOpenAIService.threads.runs.list(
              thread.id
            );

            // Check if any run uses this assistant
            const hasAssistantRun = runs.data.some(
              (run) => run.assistant_id === assistantId
            );

            if (hasAssistantRun) {
              // Get messages for this thread
              const messages = await UnifiedOpenAIService.threads.messages.list(
                thread.id
              );

              return {
                ...thread,
                messages: messages.data,
                runs: runs.data.filter(
                  (run) => run.assistant_id === assistantId
                ),
              };
            }
            return null;
          } catch (error) {
            console.error(`Error processing thread ${thread.id}:`, error);
            return null;
          }
        })
      );

      // Filter out null entries and sort by created_at date
      const filteredThreads = threadsWithRuns
        .filter((thread) => thread !== null)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return {
        threads: filteredThreads,
        summary: {
          total_threads: filteredThreads.length,
          total_messages: filteredThreads.reduce(
            (sum, thread) => sum + thread.messages.length,
            0
          ),
          total_runs: filteredThreads.reduce(
            (sum, thread) => sum + thread.runs.length,
            0
          ),
          latest_thread: filteredThreads[0]?.created_at || null,
        },
      };
    } catch (error) {
      console.error("Error fetching assistant threads:", error);
      throw new Error(`Failed to fetch assistant threads: ${error.message}`);
    }
  },
};

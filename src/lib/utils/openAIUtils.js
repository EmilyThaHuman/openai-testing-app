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

/**
 * Sends a message to an OpenAI assistant and handles the response stream
 * @param {Object} params - The parameters for sending a message
 * @param {string} params.threadId - Optional thread ID. If not provided, a new thread will be created
 * @param {string} params.message - The message content to send
 * @param {string} params.assistantId - The ID of the assistant to use
 * @param {Object} params.options - Additional options for the message
 * @param {Function} params.onStream - Callback for streaming updates
 * @param {Function} params.onToolCall - Callback for tool calls
 * @param {Function} params.onError - Callback for error handling
 * @returns {Promise<{threadId: string, messageId: string, runId: string}>}
 */
export const sendAssistantMessage = async ({
  threadId = null,
  message,
  assistantId,
  options = {},
  onStream = () => {},
  onToolCall = async () => {},
  onError = () => {},
}) => {
  try {
    // Create a thread if none exists
    const thread = threadId 
      ? await UnifiedOpenAIService.threads.retrieve(threadId)
      : await UnifiedOpenAIService.threads.create();

    // Add the user message to the thread
    const createdMessage = await UnifiedOpenAIService.threads.messages.create(
      thread.id, 
      message
    );

    // Start the run
    const run = await UnifiedOpenAIService.threads.runs.create(
      thread.id,
      assistantId,
      {
        ...options,
        stream: true
      }
    );

    // Process the run stream
    let runResult = run;
    
    while (runResult.status !== "completed") {
      // Check for required actions (tool calls)
      if (runResult.status === "requires_action" && 
          runResult.required_action?.type === "submit_tool_outputs") {
        
        const toolOutputs = await Promise.all(
          runResult.required_action.submit_tool_outputs.tool_calls.map(async (toolCall) => {
            try {
              const toolArgs = JSON.parse(toolCall.function.arguments);
              
              // Notify about tool call
              onStream({
                type: 'tool-call',
                toolCall: {
                  id: toolCall.id,
                  name: toolCall.function.name,
                  args: toolArgs
                }
              });

              // Execute tool call
              const result = await onToolCall(toolCall.function.name, toolArgs);

              // Notify about tool result
              onStream({
                type: 'tool-result',
                toolCall: {
                  id: toolCall.id,
                  result
                }
              });

              return {
                tool_call_id: toolCall.id,
                output: JSON.stringify(result)
              };
            } catch (error) {
              console.error(`Error executing tool ${toolCall.function.name}:`, error);
              throw error;
            }
          })
        );

        // Submit tool outputs and continue run
        runResult = await UnifiedOpenAIService.threads.runs.submitToolOutputs(
          thread.id,
          runResult.id,
          {
            tool_outputs: toolOutputs
          }
        );
      } else {
        // Wait for run to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        runResult = await UnifiedOpenAIService.threads.runs.retrieve(
          thread.id,
          runResult.id
        );
      }

      // Stream status updates
      onStream({
        type: 'status',
        status: runResult.status
      });
    }

    // Get the final messages
    const messages = await UnifiedOpenAIService.threads.messages.list(thread.id);

    return {
      threadId: thread.id,
      messageId: createdMessage.id,
      runId: runResult.id,
      messages: messages.data
    };
  } catch (error) {
    onError(error);
    throw error;
  }
};

// Example usage:
/*
const handleSendMessage = async (message) => {
  try {
    const result = await sendAssistantMessage({
      message,
      assistantId: selectedAssistant.id,
      onStream: (update) => {
        if (update.type === 'status') {
          setStatus(update.status);
        } else if (update.type === 'tool-call') {
          console.log('Tool called:', update.toolCall);
        }
      },
      onToolCall: async (name, args) => {
        // Handle specific tool calls
        switch (name) {
          case 'get_weather':
            return await getWeather(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    });

    setMessages(result.messages);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};
*/
import Anthropic from "@anthropic-ai/sdk";

let anthropicInstance = null;

const checkInitialization = () => {
  if (!anthropicInstance) {
    throw new Error(
      "Anthropic not initialized. Call initialize with API key first."
    );
  }
  return anthropicInstance;
};

export const UnifiedAnthropicService = {
  // Initialization
  initialize: (apiKey) => {
    if (!apiKey) return;
    anthropicInstance = new Anthropic({
      apiKey,
    });
  },

  setApiKey: (apiKey) => {
    if (!apiKey) return;
    anthropicInstance = new Anthropic({
      apiKey,
    });
  },

  // Messages
  messages: {
    create: async (data) => {
      try {
        const client = checkInitialization();
        const defaultRequest = {
          model: "claude-3-opus-20240229",
          max_tokens: 1024,
          temperature: 0.7,
        };

        const response = await client.messages.create({
          ...defaultRequest,
          ...data,
        });

        return response;
      } catch (error) {
        console.error("Anthropic API Error:", error);
        throw error;
      }
    },

    createStream: async (data, onData) => {
      try {
        const client = checkInitialization();
        const defaultRequest = {
          model: "claude-3-opus-20240229",
          max_tokens: 1024,
          temperature: 0.7,
          stream: true,
        };

        const stream = await client.messages.create({
          ...defaultRequest,
          ...data,
        });

        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta") {
            onData(chunk);
          }
        }
      } catch (error) {
        console.error("Anthropic Stream Error:", error);
        throw error;
      }
    },

    get: async (messageId) => {
      const client = checkInitialization();
      return await client.messages.retrieve(messageId);
    },

    list: async () => {
      const client = checkInitialization();
      const response = await client.messages.list();
      return { data: response.data };
    },
  },

  // Models
  models: {
    list: async () => {
      const client = checkInitialization();
      const response = await client.models.list();
      return { data: response.data };
    },

    get: async (modelId) => {
      const client = checkInitialization();
      return await client.models.retrieve(modelId);
    },
  },

  // React hook for convenience
  useMessages: (initialPrompt = "") => {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [completion, setCompletion] = React.useState("");
    const [streamingContent, setStreamingContent] = React.useState("");

    const createMessage = async (prompt, options = {}) => {
      setLoading(true);
      setError(null);
      try {
        const messages = [{ role: "user", content: prompt }];
        const response = await UnifiedAnthropicService.messages.create({
          messages,
          ...options,
        });
        setCompletion(response.content[0].text);
        return response;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const createStreamingMessage = async (prompt, options = {}) => {
      setLoading(true);
      setError(null);
      setStreamingContent("");

      try {
        await UnifiedAnthropicService.messages.createStream(
          {
            messages: [{ role: "user", content: prompt }],
            ...options,
          },
          (chunk) => {
            if (chunk.delta?.text) {
              setStreamingContent((prev) => prev + chunk.delta.text);
            }
          }
        );
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    return {
      loading,
      error,
      completion,
      streamingContent,
      createMessage,
      createStreamingMessage,
    };
  },
};

/* Usage Examples:

// Initialize the service
UnifiedAnthropicService.initialize('your-api-key');

// Regular message creation
const response = await UnifiedAnthropicService.messages.create({
  messages: [{ role: 'user', content: 'Tell me a joke' }]
});

// Streaming message
await UnifiedAnthropicService.messages.createStream(
  {
    messages: [{ role: 'user', content: 'Write a story...' }]
  },
  (chunk) => console.log('Received:', chunk.delta?.text)
);

// Using the React hook
function ChatComponent() {
  const {
    loading,
    error,
    completion,
    streamingContent,
    createMessage,
    createStreamingMessage
  } = UnifiedAnthropicService.useMessages();

  const handleSubmit = async () => {
    // Regular completion
    await createMessage('Tell me a joke');
    
    // Or streaming completion
    await createStreamingMessage('Write a story...');
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {completion && <p>Completion: {completion}</p>}
      {streamingContent && <p>Streaming: {streamingContent}</p>}
      <button onClick={handleSubmit}>Generate</button>
    </div>
  );
}
*/

export default UnifiedAnthropicService;

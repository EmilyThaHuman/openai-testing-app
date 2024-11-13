import { useState, useEffect } from 'react';
import { OpenAI } from 'openai';

const InteractiveAssistant = () => {
  const [assistantId, setAssistantId] = useState(
    import.meta.env.VITE_ASSISTANT_ID
  );
  const [vectorStoreId, setVectorStoreId] = useState(
    import.meta.env.VITE_VECTOR_STORE_ID
  );
  const [threadId, setThreadId] = useState(
    import.meta.env.VITE_OPENAI_THREAD_ID
  );
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  let client;

  useEffect(() => {
    const initializeAssistant = async () => {
      try {
        client = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY });

        // Update the assistant with the vector store
        await client.beta.assistants.update({
          assistant_id: assistantId,
          instructions: 'You are a helpful assistant.',
          name: 'AI Assistant',
          tool_resources: {
            file_search: { vector_store_ids: [vectorStoreId] },
          },
        });

        // Create a new thread
        const thread = await client.beta.threads.create();
        setThreadId(thread.id);
      } catch (error) {
        console.error('Error initializing assistant:', error);
      }
    };

    initializeAssistant();
  }, [assistantId, vectorStoreId, client]);

  const handleInputChange = e => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setConversation(prev => [...prev, { role: 'user', content: userInput }]);
    setIsLoading(true);
    setUserInput('');

    try {
      // Send user message
      await client.beta.threads.messages.create({
        thread_id: threadId,
        role: 'user',
        content: userInput,
      });

      // Create and poll run
      const run = await client.beta.threads.runs.create_and_poll({
        thread_id: threadId,
        assistant_id: assistantId,
      });

      // Stream assistant's response
      streamAssistantResponse(run.id);
    } catch (error) {
      console.error('Error during message handling:', error);
      setIsLoading(false);
    }
  };

  const streamAssistantResponse = async runId => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/threads/${threadId}/runs/${runId}/stream`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.body)
        throw new Error('Stream error: No response body found.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantResponse = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value);
        assistantResponse += chunk;
        setConversation(prev => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = assistantResponse;
          } else {
            updated.push({ role: 'assistant', content: assistantResponse });
          }
          return updated;
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error streaming assistant response:', error);
      setIsLoading(false);
    }
  };
  return (
    <div>
      <h1>Interactive OpenAI Assistant</h1>
      <div
        style={{
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
        }}
      >
        {conversation.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
        {isLoading && <p>Assistant is typing...</p>}
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Type your question here..."
          style={{ width: '80%', padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px' }}>
          Send
        </button>
      </form>
    </div>
  );
};

export default InteractiveAssistant;

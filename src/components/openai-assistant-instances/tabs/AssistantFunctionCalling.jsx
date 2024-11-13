import React, { useState, useEffect } from 'react';
import { OpenAI } from 'openai';
// import fetch from 'node-fetch';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;

const AssistantFunctionCalling = () => {
  const [client, setClient] = useState(null);
  const [assistantId, setAssistantId] = useState(
    import.meta.env.VITE_OPENAI_ASSISTANT_ID
  );
  const [threadId, setThreadId] = useState(
    import.meta.env.VITE_OPENAI_THREAD_ID
  );
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeClient = async () => {
      const openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
      setClient(openaiClient);

      // Check for existing assistant ID in local storage
      const storedAssistantId = localStorage.getItem('assistantId');
      if (storedAssistantId) {
        setAssistantId(storedAssistantId);
      } else {
        // Create a new assistant
        const assistant = await openaiClient.assistants.create({
          instructions:
            'You are a helpful assistant that can perform searches using the Perplexity API.',
          model: 'gpt-4-turbo',
          tools: [
            {
              type: 'function',
              function: {
                name: 'perplexity_search',
                description:
                  'This function performs a search using the Perplexity API.',
                parameters: {
                  type: 'object',
                  properties: {
                    query: {
                      type: 'string',
                      description: 'The search query string.',
                    },
                  },
                  required: ['query'],
                },
              },
            },
          ],
        });
        setAssistantId(assistant.id);
        localStorage.setItem('assistantId', assistant.id);
      }

      // Create a new thread
      const thread = await openaiClient.threads.create();
      setThreadId(thread.id);
    };

    initializeClient();
  }, []);

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
      // Create a user message in the thread
      await client.threads.messages.create({
        thread_id: threadId,
        role: 'user',
        content: userInput,
      });

      // Run the assistant to get a response
      let run = await client.threads.runs.create({
        thread_id: threadId,
        assistant_id: assistantId,
      });

      // Polling for the run status
      while (!['completed', 'failed', 'requires_action'].includes(run.status)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        run = await client.threads.runs.retrieve({
          thread_id: threadId,
          run_id: run.id,
        });
      }

      // Handle required actions
      if (run.status === 'requires_action') {
        const toolsToCall = run.required_action.submit_tool_outputs.tool_calls;

        const toolOutputArray = await Promise.all(
          toolsToCall.map(async eachTool => {
            const {
              id: toolCallId,
              function: { name: functionName, arguments: functionArgs },
            } = eachTool;
            const parsedArgs = JSON.parse(functionArgs);

            let output = '';
            if (functionName === 'perplexity_search') {
              output = await perplexitySearch(parsedArgs.query);
            }

            return { tool_call_id: toolCallId, output };
          })
        );

        // Submit the tool outputs
        run = await client.threads.runs.submitToolOutputs({
          thread_id: threadId,
          run_id: run.id,
          tool_outputs: toolOutputArray,
        });

        // Polling for the run status again
        while (
          !['completed', 'failed', 'requires_action'].includes(run.status)
        ) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          run = await client.threads.runs.retrieve({
            thread_id: threadId,
            run_id: run.id,
          });
        }
      }

      // Retrieve the assistant's response message
      const messages = await client.threads.messages.list({
        thread_id: threadId,
      });
      const responseMessage = messages.data.find(
        msg => msg.role === 'assistant'
      );

      if (responseMessage) {
        setConversation(prev => [
          ...prev,
          { role: 'assistant', content: responseMessage.content },
        ]);
      } else {
        setConversation(prev => [
          ...prev,
          { role: 'assistant', content: 'No response found.' },
        ]);
      }
    } catch (error) {
      console.error('Error during message handling:', error);
      setConversation(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'An error occurred while processing your request.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const perplexitySearch = async query => {
    try {
      const response = await fetch('https://api.perplexity.ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results.map(result => result.text).join('\n');
    } catch (error) {
      console.error('Error occurred during Perplexity search:', error);
      return 'An error occurred while performing the search.';
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
        {isLoading && <p>Loading...</p>}
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Type your question..."
          style={{ width: '80%', padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px' }}>
          Send
        </button>
      </form>
    </div>
  );
};

export default AssistantFunctionCalling;
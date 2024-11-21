import { SystemMessage, HumanMessage } from 'langchain/schema';
import { ChatOpenAI } from 'langchain/chat_models/openai';

export async function summarizeMessages(messages, sessionId) {
  const summarizeFunction = {
    name: 'summarize_messages',
    description: 'Summarize a list of chat messages with an overall summary and individual message summaries including their IDs.',
    parameters: {
      type: 'object',
      properties: {
        overallSummary: {
          type: 'string',
          description: 'An overall summary of the chat messages.',
        },
        individualSummaries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'The ID of the chat message.' },
              summary: { type: 'string', description: 'A summary of the individual chat message.' },
            },
            required: ['id', 'summary'],
          },
        },
      },
      required: ['overallSummary', 'individualSummaries'],
    },
  };

  const chatOpenAI = new ChatOpenAI({
    modelName: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL || 'gpt-3.5-turbo',
    openAIApiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
  });

  try {
    const response = await chatOpenAI.call(
      [
        new SystemMessage('You are a helpful assistant that summarizes chat messages.'),
        new HumanMessage(`Summarize these messages. Provide an overall summary and a summary for each message with its corresponding ID: ${JSON.stringify(messages.slice(-5))}`)
      ],
      {
        functions: [summarizeFunction],
        function_call: { name: 'summarize_messages' }
      }
    );

    const functionCall = response.additional_kwargs.function_call;
    if (functionCall && functionCall.name === 'summarize_messages') {
      const { overallSummary, individualSummaries } = JSON.parse(functionCall.arguments);
      return {
        overallSummary,
        individualSummaries: individualSummaries.map(summary => ({
          id: summary.id,
          summary: summary.summary,
        })),
      };
    }
    return {
      overallSummary: 'Unable to generate summary',
      individualSummaries: [],
    };
  } catch (error) {
    console.error('Error in summarizeMessages:', error);
    throw error;
  }
}

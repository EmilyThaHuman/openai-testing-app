import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
  dangerouslyAllowBrowser: true
})

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
  }

  try {
    const response = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes chat messages.'
        },
        {
          role: 'user',
          content: `Summarize these messages. Provide an overall summary and a summary for each message with its corresponding ID: ${JSON.stringify(messages.slice(-5))}`
        }
      ],
      functions: [summarizeFunction],
      function_call: { name: 'summarize_messages' }
    })

    const functionCall = response.choices[0]?.message?.function_call
    if (functionCall && functionCall.name === 'summarize_messages') {
      const { overallSummary, individualSummaries } = JSON.parse(functionCall.arguments)
      return {
        overallSummary,
        individualSummaries: individualSummaries.map(summary => ({
          id: summary.id,
          summary: summary.summary,
        })),
      }
    }
    return {
      overallSummary: 'Unable to generate summary',
      individualSummaries: [],
    }
  } catch (error) {
    console.error('Error in summarizeMessages:', error)
    throw error
  }
}

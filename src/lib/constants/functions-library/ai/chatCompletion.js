import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
  dangerouslyAllowBrowser: true
})

export async function createChatCompletion(messages, maxTokens = 150, temperature = 0.7) {
  try {
    const response = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL || 'gpt-3.5-turbo',
      messages: messages.map(msg => ({
        role: msg.role || 'user',
        content: msg.content
      })),
      temperature,
      max_tokens: maxTokens
    })

    return response.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error in createChatCompletion:', error.response ? error.response.data : error.message)
    throw new Error('OpenAI API request failed.')
  }
}

// Helper function to create a system message
export function createSystemMessage(content) {
  return {
    role: 'system',
    content
  }
}

// Helper function to create a user message
export function createUserMessage(content) {
  return {
    role: 'user',
    content
  }
}

// Helper function to create an assistant message
export function createAssistantMessage(content) {
  return {
    role: 'assistant',
    content
  }
}

export default {
  createChatCompletion,
  createSystemMessage,
  createUserMessage,
  createAssistantMessage
} 
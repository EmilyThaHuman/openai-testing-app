import { OpenAI } from '@langchain/openai'
import { ChatGroq } from '@langchain/groq'
import { ChatAnthropic } from '@langchain/community/chat_models/anthropic'

export const createLangChainOpenAI = () => {
  return new OpenAI({
    openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
    temperature: 0.7,
  })
}

export const createLangChainGroq = () => {
  return new ChatGroq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    temperature: 0.7,
  })
}

export const createLangChainAnthropic = () => {
  return new ChatAnthropic({
    anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    temperature: 0.7,
  }) 
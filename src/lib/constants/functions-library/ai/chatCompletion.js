import { ChatOpenAI } from 'langchain/chat_models/openai';
import logger from '../utils/logger';

const chatOpenAI = new ChatOpenAI({
  modelName: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL || 'gpt-3.5-turbo',
  openAIApiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
});

export async function createChatCompletion(messages, maxTokens = 150, temperature = 0.7) {
  try {
    const chatModel = new ChatOpenAI({
      modelName: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL || 'gpt-3.5-turbo',
      temperature,
      maxTokens,
      openAIApiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
    });
    const response = await chatModel.call(messages);
    return response.content.trim();
  } catch (error) {
    logger.error('Error in createChatCompletion:', error.response ? error.response.data : error.message);
    throw new Error('OpenAI API request failed.');
  }
} 
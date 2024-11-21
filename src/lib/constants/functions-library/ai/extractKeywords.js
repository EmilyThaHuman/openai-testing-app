import { SystemMessage, HumanMessage } from 'langchain/schema';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import logger from '../utils/logger';

const chatOpenAI = new ChatOpenAI({
  modelName: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL || 'gpt-3.5-turbo',
  openAIApiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
});

export async function extractKeywords(text) {
  const systemMessage = new SystemMessage(
    'You are a helpful assistant that extracts main keywords from given text.'
  );
  const humanMessage = new HumanMessage(
    `Extract the main keywords from the following text:\n\n${text}\n\nProvide the keywords as a comma-separated list.`
  );

  const response = await chatOpenAI.call([systemMessage, humanMessage]);
  logger.info(`Extracted keywords: ${response.content}`);
  return response.content.split(',').map(keyword => keyword.trim());
} 
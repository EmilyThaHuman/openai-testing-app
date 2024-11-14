import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import logger from '../utils/logger';

export async function formatScrapedContent(scrapedData) {
  try {
    const chatModel = new ChatOpenAI({
      modelName: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL || 'gpt-3.5-turbo',
      temperature: 0.3,
      maxTokens: 2000,
      openAIApiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
    });

    const systemPrompt = new SystemMessage({
      content: `You are a technical documentation expert. Your task is to:
1. Clean and organize the provided scraped website content
2. Format it into clear, well-structured markdown documentation
3. Ensure proper heading hierarchy (h1, h2, h3)
4. Include relevant code blocks with proper syntax highlighting
5. Add tables where appropriate to organize information
6. Include any important links from the original content
7. Remove any redundant or promotional content
8. Ensure the documentation follows technical writing best practices`
    });

    const userMessage = new HumanMessage({
      content: `Please format the following scraped website content into clean, production-ready markdown documentation:\n\n${JSON.stringify(scrapedData)}`
    });

    const response = await chatModel.call([systemPrompt, userMessage]);
    return response.content.trim();
  } catch (error) {
    logger.error('Error in formatScrapedContent:', error.message);
    throw new Error('Failed to format scraped content: ' + error.message);
  }
}

// AI Analysis Functions
export { analyzeComponent } from './ai/analysis/analyzeComponent';
export { analyzeUserSentiment } from './ai/analysis/analyzeUserSentiment';
export { analyzeTextWithGPT } from './ai/analyzeTextWithGPT';

// AI Chat Functions
export { createChatCompletion } from './ai/chatCompletion';
export { extractKeywords } from './ai/extractKeywords';
export { formatScrapedContent } from './ai/formatScrapedContent';
export { generateOptimizedPrompt } from './ai/generateOptimizedPrompt';
export { summarizeMessages } from './ai/summarizeMessages';

// AI Models
export { falAiStableDiffusion3Medium } from './ai/falAiStableDiffusion3Medium';
export { generateRecommendations } from './ai/generateRecommendations';
export { streamChatCompletion } from './ai/streamChatCompletion';

// API Gateways
export { portKeyAIGateway } from './api-gateways/portKeyAIGateway';
export { portKeyAIGatewayTogetherAI } from './api-gateways/portKeyAIGatewayTogetherAI';

// API Functions
export { perplexitySearch } from './web/perplexitySearch';

// Data Analysis
export {
  analyzeTrends,
  calculateStatistics,
  compareDataSets,
  generatePredictions,
} from './data-analysis/dataAnalysis';
export { performDataAnalysis } from './ai/analysis/performDataAnalysis';

// Knowledge Base
export { searchKnowledgeBase } from './ai/searchKnowledgeBase';

// System Functions
export { execute as openApp } from './system/openApp';

// System Utilities
export { getDeviceContext } from './ai/getDeviceContext';

// Web Tools
export { brightDataWebScraper } from './web/brightDataWebScraper';
export { scrapeWithJinaReader as scrapeWebsite } from './web/jinaWebScraper';
export { execute as takeScreenshot } from './web/takeScreenshot';

// Export tool configurations
export const toolConfigurations = {
  // Web Tools
  brightDataWebScraper: {
    requiresAuth: true,
    apiKeyEnv: 'BRIGHT_DATA_API_KEY',
  },
  scrapeWebsite: {
    requiresAuth: true,
    apiKeyEnv: 'JINA_READER_API_KEY',
  },
  takeScreenshot: {
    requiresAuth: false,
  },

  // AI Models
  falAiStableDiffusion: {
    requiresAuth: true,
    apiKeyEnv: 'FAL_AI_API_KEY',
  },
  perplexitySearch: {
    requiresAuth: true,
    apiKeyEnv: 'PERPLEXITY_API_KEY',
  },
  portKeyAI: {
    requiresAuth: true,
    apiKeyEnv: 'PORTKEY_API_KEY',
  },
  portKeyAITogetherAI: {
    requiresAuth: true,
    apiKeyEnv: ['PORTKEY_API_KEY', 'TOGETHER_AI_API_KEY'],
  },

  // Analysis Tools
  analyzeUserSentiment: {
    requiresAuth: true,
    apiKeyEnv: 'OPENAI_API_KEY',
  },
  performDataAnalysis: {
    requiresAuth: false,
  },

  // System Tools
  getDeviceContext: {
    requiresAuth: false,
  },
  openApp: {
    requiresAuth: false,
  },

  // Knowledge Tools
  searchKnowledgeBase: {
    requiresAuth: false,
  },
};

export const AI_TOOL_CONFIG = toolConfigurations;

// Export function categories for organization
export const functionCategories = {
  web: ['brightDataWebScraper', 'scrapeWebsite', 'takeScreenshot'],
  ai: [
    'falAiStableDiffusion',
    'perplexitySearch',
    'portKeyAI',
    'portKeyAITogetherAI',
    'analyzeTextWithGPT',
  ],
  analysis: ['analyzeUserSentiment', 'performDataAnalysis', 'analyzeComponent'],
  system: ['getDeviceContext', 'openApp'],
  knowledge: ['searchKnowledgeBase'],
};

// Export utility functions
export const getToolConfig = toolName => toolConfigurations[toolName];
export const getToolCategory = toolName => {
  return Object.entries(functionCategories).find(([category, tools]) =>
    tools.includes(toolName)
  )?.[0];
};

// Export version info
export const VERSION = '1.0.0';
export const LAST_UPDATED = '2024-03-14';

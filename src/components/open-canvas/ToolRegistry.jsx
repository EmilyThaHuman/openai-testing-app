import {
  // Web Tools
  brightDataWebScraper,
  scrapeWebsite,
  takeScreenshot,
  
  // AI Tools
  falAiStableDiffusion3Medium,
  perplexitySearch,
  portKeyAIGateway,
  portKeyAIGatewayTogetherAI,
  
  // Analysis Tools
  analyzeUserSentiment,
  performDataAnalysis,
  
  // System Tools
  getDeviceContext,
  openApp,
  
  // Knowledge Tools
  searchKnowledgeBase
} from '@/lib/constants/functions-library'

export const toolRegistry = {
  // Web Tools
  brightDataWebScraper: {
    name: 'brightDataWebScraper',
    function: brightDataWebScraper,
    description: 'Scrape content from websites using BrightData',
    requiresAuth: true,
    category: 'web'
  },
  scrapeWebsite: {
    name: 'scrapeWebsite',
    function: scrapeWebsite,
    description: 'Scrape website content using Puppeteer',
    requiresAuth: false,
    category: 'web'
  },
  takeScreenshot: {
    name: 'takeScreenshot',
    function: takeScreenshot,
    description: 'Take screenshots of websites',
    requiresAuth: false,
    category: 'web'
  },

  // AI Tools
  falAiStableDiffusion: {
    name: 'falAiStableDiffusion',
    function: falAiStableDiffusion3Medium,
    description: 'Generate images using Stable Diffusion',
    requiresAuth: true,
    category: 'ai'
  },
  perplexitySearch: {
    name: 'perplexitySearch',
    function: perplexitySearch,
    description: 'Search using Perplexity AI',
    requiresAuth: true,
    category: 'ai'
  },
  portKeyAI: {
    name: 'portKeyAI',
    function: portKeyAIGateway,
    description: 'Use PortKey AI gateway',
    requiresAuth: true,
    category: 'ai'
  },
  portKeyAITogetherAI: {
    name: 'portKeyAITogetherAI',
    function: portKeyAIGatewayTogetherAI,
    description: 'Use PortKey AI with TogetherAI',
    requiresAuth: true,
    category: 'ai'
  },

  // Analysis Tools
  analyzeUserSentiment: {
    name: 'analyzeUserSentiment',
    function: analyzeUserSentiment,
    description: 'Analyze user sentiment in text',
    requiresAuth: false,
    category: 'data'
  },
  performDataAnalysis: {
    name: 'performDataAnalysis',
    function: performDataAnalysis,
    description: 'Perform data analysis',
    requiresAuth: false,
    category: 'data'
  },

  // System Tools
  getDeviceContext: {
    name: 'getDeviceContext',
    function: getDeviceContext,
    description: 'Get device context information',
    requiresAuth: false,
    category: 'system'
  },
  openApp: {
    name: 'openApp',
    function: openApp,
    description: 'Open system applications',
    requiresAuth: false,
    category: 'system'
  },

  // Knowledge Tools
  searchKnowledgeBase: {
    name: 'searchKnowledgeBase',
    function: searchKnowledgeBase,
    description: 'Search internal knowledge base',
    requiresAuth: false,
    category: 'tools'
  }
}

export const getToolFunction = (toolName) => {
  const tool = toolRegistry[toolName]
  if (!tool) {
    throw new Error(`Tool ${toolName} not found`)
  }
  return tool.function
}

export const getToolDescription = (toolName) => {
  const tool = toolRegistry[toolName]
  if (!tool) {
    throw new Error(`Tool ${toolName} not found`)
  }
  return tool.description
}

export const requiresAuth = (toolName) => {
  const tool = toolRegistry[toolName]
  if (!tool) {
    throw new Error(`Tool ${toolName} not found`)
  }
  return tool.requiresAuth
}

export const getToolCategory = (toolName) => {
  const tool = toolRegistry[toolName]
  if (!tool) {
    throw new Error(`Tool ${toolName} not found`)
  }
  return tool.category
} 
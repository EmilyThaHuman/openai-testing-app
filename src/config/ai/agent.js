export const REACT_AGENT_CONFIG = {
  // API Configuration
  usePortkey: true,
  useOllamaInference: false,
  nonOllamaBaseURL: 'https://api.openai.com/v1',
  inferenceAPIKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,

  // Model Configuration
  defaultModel: 'gpt-4-turbo-preview',
  fallbackModel: 'gpt-3.5-turbo',
  
  // Rate Limiting
  maxRequestsPerMinute: 50,
  maxTokensPerRequest: 4000,
  
  // Streaming Configuration
  enableStreaming: true,
  streamChunkSize: 1000,
  
  // Retry Configuration
  maxRetries: 3,
  retryDelay: 1000,
  
  // Cache Configuration
  enableCache: true,
  cacheDuration: 3600, // 1 hour
  
  // Function Calling
  enableFunctionCalling: true,
  maxFunctionCallDepth: 5,
  
  // Tool Integration
  tools: {
    brightData: {
      enabled: true,
      maxScrapesPerDay: 1000
    },
    perplexity: {
      enabled: true,
      maxQueriesPerDay: 100
    },
    falAi: {
      enabled: true,
      maxGenerationsPerDay: 50
    }
  },
  
  // Logging Configuration
  logLevel: 'info',
  enableMetrics: true,
  
  // Security
  enableSanitization: true,
  maxOutputLength: 100000,
  
  // Development
  isDevelopment: process.env.NODE_ENV === 'development',
  enableDebugMode: false
}

// Helper functions
export const isToolEnabled = (toolName) => {
  return REACT_AGENT_CONFIG.tools[toolName]?.enabled ?? false
}

export const getToolLimit = (toolName) => {
  const tool = REACT_AGENT_CONFIG.tools[toolName]
  if (!tool) return null
  
  const limits = {
    brightData: tool.maxScrapesPerDay,
    perplexity: tool.maxQueriesPerDay,
    falAi: tool.maxGenerationsPerDay
  }
  
  return limits[toolName]
}

export const getModelConfig = (modelName) => {
  const models = {
    'gpt-4-turbo-preview': {
      maxTokens: 4000,
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    },
    'gpt-3.5-turbo': {
      maxTokens: 2000,
      temperature: 0.8,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    }
  }
  
  return models[modelName] || models[REACT_AGENT_CONFIG.fallbackModel]
}

export default {
  REACT_AGENT_CONFIG,
  isToolEnabled,
  getToolLimit,
  getModelConfig
} 
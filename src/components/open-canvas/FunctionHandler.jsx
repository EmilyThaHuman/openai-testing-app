import { getToolFunction, requiresAuth } from './ToolRegistry'

export class FunctionHandler {
  constructor(apiKeys = {}) {
    this.apiKeys = apiKeys
  }

  async callFunction(functionName, args, streamable) {
    try {
      // Check if function exists
      const func = getToolFunction(functionName)
      
      // Check auth requirements
      if (requiresAuth(functionName) && !this.hasRequiredApiKey(functionName)) {
        throw new Error(`${functionName} requires authentication`)
      }

      // Execute function
      const result = await func(args, streamable)
      
      return {
        success: true,
        data: result
      }

    } catch (error) {
      console.error(`Error calling function ${functionName}:`, error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  hasRequiredApiKey(functionName) {
    switch(functionName) {
      case 'brightDataWebScraper':
        return !!this.apiKeys.brightData
      case 'falAiStableDiffusion':
        return !!this.apiKeys.falAi  
      case 'perplexitySearch':
        return !!this.apiKeys.perplexity
      case 'portKeyAI':
      case 'portKeyAITogetherAI':
        return !!this.apiKeys.portKey
      default:
        return true
    }
  }

  setApiKey(service, key) {
    this.apiKeys[service] = key
  }
} 
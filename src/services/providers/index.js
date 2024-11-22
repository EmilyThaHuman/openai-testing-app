export { default as openAI } from './openai'
export { default as anthropic } from './anthropic'
export { default as groq } from './groq'
export { default as falClient } from './fal'
export { default as portkey } from './portkey'
export { default as mistral } from './mistral'
export { default as cohere } from './cohere'
export { default as perplexity } from './perplexity'
export { default as palm } from './palm'
export { default as replicate } from './replicate'
export {
  createLangChainOpenAI,
  createLangChainGroq,
  createLangChainAnthropic,
} from './langchain'

// Helper function to check if API keys are configured
export const getConfiguredProviders = () => {
  const providers = []
  
  if (import.meta.env.VITE_OPENAI_API_KEY) providers.push('openai')
  if (import.meta.env.VITE_ANTHROPIC_API_KEY) providers.push('anthropic')
  if (import.meta.env.VITE_GROQ_API_KEY) providers.push('groq')
  if (import.meta.env.VITE_FAL_KEY) providers.push('fal')
  if (import.meta.env.VITE_PORTKEY_API_KEY) providers.push('portkey')
  if (import.meta.env.VITE_MISTRAL_API_KEY) providers.push('mistral')
  if (import.meta.env.VITE_COHERE_API_KEY) providers.push('cohere')
  if (import.meta.env.VITE_PERPLEXITY_API_KEY) providers.push('perplexity')
  if (import.meta.env.VITE_PALM_API_KEY) providers.push('palm')
  if (import.meta.env.VITE_REPLICATE_API_KEY) providers.push('replicate')
  
  return providers
}

// Helper to get default model for a provider
export const getDefaultModel = (provider) => {
  return DEFAULT_MODELS[provider] || null
}

// Helper to check if provider supports a feature
export const hasFeature = (provider, feature) => {
  return PROVIDER_FEATURES[provider]?.includes(feature) || false
} 
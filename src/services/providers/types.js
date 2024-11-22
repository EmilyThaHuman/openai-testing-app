/**
 * @typedef {Object} ProviderConfig
 * @property {string} apiKey - The API key for the provider
 * @property {number} [temperature] - Temperature setting for response randomness
 * @property {string} [model] - The model to use
 * @property {boolean} [stream] - Whether to stream the response
 * @property {number} [maxTokens] - Maximum tokens in response
 * @property {number} [topP] - Top P sampling parameter
 * @property {number} [frequencyPenalty] - Frequency penalty parameter
 * @property {number} [presencePenalty] - Presence penalty parameter
 */

/**
 * @typedef {'openai' | 'anthropic' | 'groq' | 'fal' | 'portkey' | 'cohere' | 'mistral' | 'perplexity' | 'palm' | 'replicate'} ProviderType
 */

export const PROVIDER_MODELS = {
  openai: [
    'gpt-4-turbo-preview',
    'gpt-4-vision-preview',
    'gpt-4-1106-preview',
    'gpt-4',
    'gpt-4-32k',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
    'dall-e-3',
    'dall-e-2',
    'whisper-1',
    'tts-1', 
    'tts-1-hd',
    'text-embedding-3-small',
    'text-embedding-3-large'
  ],
  anthropic: [
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'claude-2.1',
    'claude-2.0',
    'claude-instant-1.2'
  ],
  groq: [
    'mixtral-8x7b-32768',
    'llama2-70b-4096',
    'gemma-7b-it',
    'mixtral-8x7b-instruct',
    'llama2-70b',
    'llama2-13b',
    'llama2-7b'
  ],
  mistral: [
    'mistral-large-latest',
    'mistral-medium-latest',
    'mistral-small-latest',
    'mistral-tiny-latest',
    'mixtral-8x7b-instruct',
    'mistral-7b-instruct'
  ],
  cohere: [
    'command',
    'command-light',
    'command-nightly',
    'command-r',
    'embed-english-v3.0',
    'embed-multilingual-v3.0'
  ],
  perplexity: [
    'pplx-7b-online',
    'pplx-70b-online',
    'pplx-7b-chat',
    'pplx-70b-chat',
    'mixtral-8x7b-instruct',
    'codellama-34b-instruct',
    'llama-2-70b-chat'
  ],
  replicate: [
    'llama-2-70b-chat',
    'stable-diffusion-xl',
    'sdxl-turbo',
    'deepfloyd-if',
    'blip-2'
  ],
  palm: [
    'gemini-pro',
    'gemini-pro-vision',
    'text-bison-32k',
    'chat-bison-32k',
    'embedding-gecko-001'
  ]
}

export const DEFAULT_MODELS = {
  openai: 'gpt-4-turbo-preview',
  anthropic: 'claude-3-opus-20240229',
  groq: 'mixtral-8x7b-32768',
  mistral: 'mistral-large-latest',
  cohere: 'command',
  perplexity: 'pplx-70b-online',
  palm: 'gemini-pro'
}

export const PROVIDER_FEATURES = {
  openai: ['chat', 'images', 'audio', 'embeddings', 'vision'],
  anthropic: ['chat', 'vision'],
  groq: ['chat'],
  mistral: ['chat', 'embeddings'],
  cohere: ['chat', 'embeddings', 'rerank'],
  perplexity: ['chat'],
  palm: ['chat', 'vision', 'embeddings'],
  replicate: ['chat', 'images', 'audio', 'video']
} 
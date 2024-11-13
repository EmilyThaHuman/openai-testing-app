// OpenAI Models
export const OPENAI_MODELS = {
  GPT_4O_MINI: "gpt-4o-mini",
  GPT_4O: "gpt-4o",
  GPT_4_TURBO_PREVIEW: "gpt-4-turbo-preview",
  GPT_4_VISION_PREVIEW: "gpt-4-vision-preview",
  GPT_4: "gpt-4",
  GPT_3_5_TURBO: "gpt-3.5-turbo",
};

// Google Models
export const GOOGLE_MODELS = {
  GEMINI_PRO: "gemini-pro",
  GEMINI_PRO_VISION: "gemini-pro-vision",
  GEMINI_1_5_PRO_LATEST: "gemini-1.5-pro-latest",
  GEMINI_1_5_FLASH: "gemini-1.5-flash",
};

// Anthropic Models
export const ANTHROPIC_MODELS = {
  CLAUDE_2_1: "claude-2.1",
  CLAUDE_INSTANT_1_2: "claude-instant-1.2",
  CLAUDE_3_HAIKU: "claude-3-haiku-20240307",
  CLAUDE_3_SONNET: "claude-3-sonnet-20240229",
  CLAUDE_3_OPUS: "claude-3-opus-20240229",
  CLAUDE_3_5_SONNET: "claude-3-5-sonnet-20240620",
};

// Mistral Models
export const MISTRAL_MODELS = {
  TINY: "mistral-tiny",
  SMALL_LATEST: "mistral-small-latest",
  MEDIUM_LATEST: "mistral-medium-latest",
  LARGE_LATEST: "mistral-large-latest",
};

// Groq Models
export const GROQ_MODELS = {
  LLAMA3_8B: "llama3-8b-8192",
  LLAMA3_70B: "llama3-70b-8192",
  MIXTRAL_8X7B: "mixtral-8x7b-32768",
  GEMMA_7B_IT: "gemma-7b-it",
};

// Perplexity Models
export const PERPLEXITY_MODELS = {
  PPLX_7B_ONLINE: "pplx-7b-online",
  PPLX_70B_ONLINE: "pplx-70b-online",
  PPLX_7B_CHAT: "pplx-7b-chat",
  PPLX_70B_CHAT: "pplx-70b-chat",
  MIXTRAL_8X7B_INSTRUCT: "mixtral-8x7b-instruct",
  MISTRAL_7B_INSTRUCT: "mistral-7b-instruct",
  LLAMA_2_70B_CHAT: "llama-2-70b-chat",
  CODELLAMA_34B_INSTRUCT: "codellama-34b-instruct",
  CODELLAMA_70B_INSTRUCT: "codellama-70b-instruct",
  SONAR_SMALL_CHAT: "sonar-small-chat",
  SONAR_SMALL_ONLINE: "sonar-small-online",
  SONAR_MEDIUM_CHAT: "sonar-medium-chat",
  SONAR_MEDIUM_ONLINE: "sonar-medium-online",
};

// Combined array of all model IDs
export const ALL_MODEL_IDS = [
  ...Object.values(OPENAI_MODELS),
  ...Object.values(GOOGLE_MODELS),
  ...Object.values(ANTHROPIC_MODELS),
  ...Object.values(MISTRAL_MODELS),
  ...Object.values(GROQ_MODELS),
  ...Object.values(PERPLEXITY_MODELS),
];

// Type definitions
export const OpenAILLMID = typeof OPENAI_MODELS;
export const GoogleLLMID = typeof GOOGLE_MODELS;
export const AnthropicLLMID = typeof ANTHROPIC_MODELS;
export const MistralLLMID = typeof MISTRAL_MODELS;
export const GroqLLMID = typeof GROQ_MODELS;
export const PerplexityLLMID = typeof PERPLEXITY_MODELS;

// constants.js

// Model Definitions
export const MODELS = {
  "gpt-4-turbo-preview": "GPT-4 Turbo Preview",
  "gpt-4": "GPT-4",
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "text-davinci-003": "Text-Davinci-003",
  // Add more models as needed
};

// Tool Definitions
export const TOOLS = {
  code_interpreter: "Code Interpreter",
  retrieval: "File Search & Retrieval",
  function: "Function Calling",
};

// Function Definitions (if distinct from tools)
export const FUNCTIONS = {
  sentiment_analysis: "Sentiment Analysis",
  summarization: "Text Summarization",
  translation: "Language Translation",
  // Add more functions as needed
};

// Default Assistant Configuration
export const DEFAULT_ASSISTANT = {
  name: "Default Assistant",
  instructions: "Provide helpful and accurate information.",
  model: "gpt-4-turbo-preview",
  tools: [], // Array of tool keys from TOOLS
  functions: [], // Array of function keys from FUNCTIONS
  file_ids: [], // Array of file IDs for retrieval
  metadata: {}, // Additional metadata
  temperature: 0.7, // Controls randomness: 0 (deterministic) to 1 (creative)
  top_p: 1, // Controls diversity via nucleus sampling
  presence_penalty: 0, // Penalizes new tokens based on their presence
  frequency_penalty: 0, // Penalizes new tokens based on their frequency
  response_format: { type: "text" }, // e.g., text, markdown, json
  file_search_enabled: false,
  code_interpreter_enabled: false,
  function_calling_enabled: false,
  // Additional default settings can be added here
};

// Tool Configuration Defaults
export const DEFAULT_TOOL_CONFIG = {
  code_interpreter: {
    enabled: false,
    // Add tool-specific configurations
  },
  retrieval: {
    enabled: false,
    search_depth: 5, // Example setting
    // Add more retrieval settings
  },
  function: {
    enabled: false,
    allowed_functions: [], // List of allowed function keys
    // Add more function-specific settings
  },
  // Add more tool configurations as needed
};

// Function Configuration Defaults
export const DEFAULT_FUNCTION_CONFIG = {
  sentiment_analysis: {
    language: "en",
    // Add function-specific configurations
  },
  summarization: {
    max_length: 150,
    // Add more summarization settings
  },
  translation: {
    target_language: "es",
    // Add more translation settings
  },
  // Add more function configurations as needed
};

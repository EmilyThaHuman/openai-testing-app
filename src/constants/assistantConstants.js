export const MODELS = {
  "gpt-4-turbo-preview": "GPT-4 Turbo",
  "gpt-4": "GPT-4",
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
};

export const TOOLS = {
  code_interpreter: "Code Interpreter",
  retrieval: "File Search & Retrieval",
  function: "Function Calling",
};

export const DEFAULT_ASSISTANT = {
  name: "",
  instructions: "",
  model: "gpt-4-turbo-preview",
  tools: [],
  file_ids: [],
  metadata: {},
  temperature: 0.7,
  top_p: 1,
  presence_penalty: 0,
  frequency_penalty: 0,
  response_format: { type: "text" },
};

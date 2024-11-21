export const SUPPORTED_MODELS = [
  'gpt-4-turbo-preview',
  'gpt-4',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
];

export const MODEL_DETAILS = {
  'gpt-4-turbo-preview': {
    name: 'GPT-4 Turbo',
    description: 'Most capable model, best for complex tasks',
    maxTokens: 128000,
    inputCostPer1k: 0.01,
    outputCostPer1k: 0.03
  },
  'gpt-4': {
    name: 'GPT-4',
    description: 'More capable model, good for complex tasks',
    maxTokens: 8192,
    inputCostPer1k: 0.03,
    outputCostPer1k: 0.06
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most tasks',
    maxTokens: 4096,
    inputCostPer1k: 0.0015,
    outputCostPer1k: 0.002
  },
  'gpt-3.5-turbo-16k': {
    name: 'GPT-3.5 Turbo 16K',
    description: 'Extended context version of GPT-3.5',
    maxTokens: 16384,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.004
  }
};

export const DEFAULT_MODEL = 'gpt-4-turbo-preview';

export const getModelDetails = (modelId) => {
  return MODEL_DETAILS[modelId] || MODEL_DETAILS[DEFAULT_MODEL];
};

export const validateModel = (modelId) => {
  return SUPPORTED_MODELS.includes(modelId);
};

export const getModelMaxTokens = (modelId) => {
  return MODEL_DETAILS[modelId]?.maxTokens || MODEL_DETAILS[DEFAULT_MODEL].maxTokens;
};

export const calculateModelCost = (modelId, inputTokens, outputTokens) => {
  const model = MODEL_DETAILS[modelId] || MODEL_DETAILS[DEFAULT_MODEL];
  const inputCost = (inputTokens / 1000) * model.inputCostPer1k;
  const outputCost = (outputTokens / 1000) * model.outputCostPer1k;
  return inputCost + outputCost;
}; 
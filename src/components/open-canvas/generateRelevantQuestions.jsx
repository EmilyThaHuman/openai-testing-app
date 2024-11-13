import { OpenAI } from 'openai';

import { REACT_AGENT_CONFIG } from '@/config/ai/agent';

let openai;
if (REACT_AGENT_CONFIG.useOllamaInference) {
  openai = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama',
  });
} else {
  openai = new OpenAI({
    baseURL: REACT_AGENT_CONFIG.nonOllamaBaseURL,
    apiKey: REACT_AGENT_CONFIG.inferenceAPIKey,
  });
}

const relevantQuestions = async (sources, userMessage) => {
  return await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `
                You are a Question generator who generates an array of 3 follow-up questions in JSON format.
                The JSON schema should include:
                {
                  "original": "The original search query or context",
                  "followUp": [
                    "Question 1",
                    "Question 2", 
                    "Question 3"
                  ]
                }
                `,
      },
      {
        role: 'user',
        content: `Generate follow-up questions based on the top results from a similarity search: ${JSON.stringify(sources)}. The original search query is: "${userMessage}".`,
      },
    ],
    model: REACT_AGENT_CONFIG.inferenceModel,
    response_format: { type: 'json_object' },
  });
};

export default relevantQuestions;

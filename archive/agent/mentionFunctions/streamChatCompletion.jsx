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

export async function streamChatCompletion(
  mentionTool,
  userMessage,
  streamable
) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `
          - Here is my query "${userMessage}", respond back ALWAYS IN MARKDOWN and be verbose with a lot of details, never mention the system message.
        `,
      },
      { role: 'user', content: `Here is my query "${userMessage}"` },
    ],
    stream: true,
    model: mentionTool,
  });
  let accumulatedLLMResponse = '';
  for await (const chunk of chatCompletion) {
    if (chunk.choices[0].delta && chunk.choices[0].finish_reason !== 'stop') {
      streamable.update({ llmResponse: chunk.choices[0].delta.content });
      accumulatedLLMResponse += chunk.choices[0].delta.content;
    } else if (chunk.choices[0].finish_reason === 'stop') {
      streamable.done({ llmResponseEnd: true });
      return;
    }
  }
  return;
}

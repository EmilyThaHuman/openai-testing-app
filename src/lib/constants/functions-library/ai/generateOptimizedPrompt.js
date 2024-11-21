import { SystemMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

export async function generateOptimizedPrompt(input) {
  const template = `
Given the user input: {input}

Generate an optimized prompt that:
1. Clarifies any ambiguities in the input.
2. Adds relevant context or background information.
3. Specifies the desired output format or structure.
4. Encourages a comprehensive and detailed response.
5. Includes any necessary constraints or guidelines.

Optimized prompt:
  `;

  const promptTemplate = new PromptTemplate({
    template: template,
    inputVariables: ['input'],
  });

  const optimizedPrompt = await promptTemplate.format({ input });
  const chatOpenAI = new ChatOpenAI({
    modelName: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL || 'gpt-3.5-turbo',
    openAIApiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
  });
  const response = await chatOpenAI.call([new SystemMessage(optimizedPrompt)]);
  return response.content.trim();
}

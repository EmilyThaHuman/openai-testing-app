import OpenAI from 'openai';

export async function generateOptimizedPrompt(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input: Input must be a non-empty string.');
  }

  const template = `
Given the user input: ${input}

Generate an optimized prompt that:
1. Clarifies any ambiguities in the input.
2. Adds relevant context or background information.
3. Specifies the desired output format or structure.
4. Encourages a comprehensive and detailed response.
5. Includes any necessary constraints or guidelines.

Optimized prompt:
`;

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
  });

  try {
    const response = await openai.createChatCompletion({
      model:
        import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL ||
        'gpt-3.5-turbo',
      messages: [{ role: 'system', content: template }],
    });

    const optimizedPrompt = response.data.choices[0].message.content.trim();
    return optimizedPrompt;
  } catch (err) {
    console.error('Error during OpenAI ChatCompletion:', err);
    throw err;
  }
}

import OpenAI from "openai";

export async function extractKeywords(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input: Text must be a non-empty string.');
  }

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
  });

  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful assistant that extracts main keywords from given text.',
    },
    {
      role: 'user',
      content: `Extract the main keywords from the following text:\n\n${text}\n\nProvide the keywords as a comma-separated list.`,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model:
        import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL ||
        'gpt-3.5-turbo',
      messages: messages,
    });

    const extractedKeywords = response.choices[0].message.content.trim();
    console.log(`Extracted keywords: ${extractedKeywords}`);
    return extractedKeywords.split(',').map(keyword => keyword.trim());
  } catch (error) {
    console.error('Error during OpenAI ChatCompletion:', error);
    throw error;
  }
}

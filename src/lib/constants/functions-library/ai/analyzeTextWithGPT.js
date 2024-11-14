import { OpenAI } from 'langchain/openai';

export async function analyzeTextWithGPT(text) {
  try {
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
    });
    const response = await openai.Completion.create({
      model: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL,
      prompt: `You are a PI, Extract relevant information about the following content:\n\n${text}`,
      max_tokens: 200,
    });
    return response.choices[0].text.trim();
  } catch (error) {
    console.error('Error analyzing text with GPT:', error);
    return 'Could not analyze content.';
  }
}

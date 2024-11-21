import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
  dangerouslyAllowBrowser: true,
});
export const generateRecommendations = async (
  context,
  userHistory = '',
  preferences = ''
) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'Generate personalized recommendations based on the following context, history, and preferences.',
        },
        {
          role: 'user',
          content: `Context: ${context}\nHistory: ${userHistory}\nPreferences: ${preferences}`,
        },
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Recommendation generation error:', error);
    return { error: 'Failed to generate recommendations' };
  }
};

export default generateRecommendations;

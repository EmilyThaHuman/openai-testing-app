import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
  dangerouslyAllowBrowser: true,
});

export const analyzeUserSentiment = async text => {
  try {
    // Simplified sentiment analysis
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment and key themes in this text',
        },
        {
          role: 'user',
          content: text,
        },
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return { error: 'Failed to analyze sentiment' };
  }
};

export default analyzeUserSentiment;

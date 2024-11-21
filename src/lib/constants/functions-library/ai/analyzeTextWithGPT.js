import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
  dangerouslyAllowBrowser: true
})

export async function analyzeTextWithGPT(text) {
  try {
    const response = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a PI, Extract relevant information about the following content:'
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    })

    return response.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error analyzing text with GPT:', error)
    return 'Could not analyze content.'
  }
}

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
  dangerouslyAllowBrowser: true
})

export async function formatScrapedContent(scrapedData) {
  try {
    const response = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a technical documentation expert. Your task is to:
1. Clean and organize the provided scraped website content
2. Format it into clear, well-structured markdown documentation
3. Ensure proper heading hierarchy (h1, h2, h3)
4. Include relevant code blocks with proper syntax highlighting
5. Add tables where appropriate to organize information
6. Include any important links from the original content
7. Remove any redundant or promotional content
8. Ensure the documentation follows technical writing best practices`
        },
        {
          role: 'user',
          content: `Please format the following scraped website content into clean, production-ready markdown documentation:\n\n${JSON.stringify(scrapedData)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    return response.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error in formatScrapedContent:', error.message)
    throw new Error('Failed to format scraped content: ' + error.message)
  }
}

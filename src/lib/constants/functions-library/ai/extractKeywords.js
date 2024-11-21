import OpenAI from 'openai'
import logger from '../utils/logger'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
  dangerouslyAllowBrowser: true
})

export async function extractKeywords(text) {
  try {
    const response = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts main keywords from given text.'
        },
        {
          role: 'user',
          content: `Extract the main keywords from the following text:\n\n${text}\n\nProvide the keywords as a comma-separated list.`
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    })

    const keywords = response.choices[0].message.content.trim()
    logger.info(`Extracted keywords: ${keywords}`)
    return keywords.split(',').map(keyword => keyword.trim())
  } catch (error) {
    logger.error('Error extracting keywords:', error)
    throw new Error('Failed to extract keywords: ' + error.message)
  }
} 
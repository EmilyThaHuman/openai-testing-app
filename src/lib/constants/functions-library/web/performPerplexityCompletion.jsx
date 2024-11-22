import { Configuration, OpenAIApi } from 'openai'

const logger = console

export async function performOpenAICompletion (prompt, openAIApiKey) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Invalid prompt: Prompt must be a non-empty string.')
  }
  if (!openAIApiKey || typeof openAIApiKey !== 'string') {
    throw new Error('Invalid API key: API key must be a non-empty string.')
  }

  try {
    const configuration = new Configuration({
      apiKey: openAIApiKey
    })
    const openai = new OpenAIApi(configuration)

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7
    })

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response format from OpenAI API.')
    }

    const completion = response.data.choices[0].text.trim()
    logger.info(`OpenAI completion response: ${completion}`)

    return {
      pageContent: completion,
      metadata: {
        source: 'OpenAI',
        model: 'text-davinci-003'
      }
    }
  } catch (error) {
    if (error.response) {
      logger.error(
        `OpenAI API error: ${error.response.status} - ${error.response.data.error.message}`
      )
      throw new Error(
        `OpenAI API error: ${error.response.status} - ${error.response.data.error.message}`
      )
    } else {
      logger.error('Unexpected error during OpenAI completion:', error.message)
      throw new Error(`Unexpected error during OpenAI completion: ${error.message}`)
    }
  }
}

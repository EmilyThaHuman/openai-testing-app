import Anthropic from '@anthropic-ai/sdk'

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

const anthropic = new Anthropic({
  apiKey,
})

export default anthropic 
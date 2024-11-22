import { PerplexityAI } from 'perplexity-ai'

const perplexity = new PerplexityAI({
  apiKey: import.meta.env.VITE_PERPLEXITY_API_KEY
})

export default perplexity 
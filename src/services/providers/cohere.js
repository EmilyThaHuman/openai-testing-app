import { CohereClient } from 'cohere-ai'

const cohere = new CohereClient({
  token: import.meta.env.VITE_COHERE_API_KEY
})

export default cohere 
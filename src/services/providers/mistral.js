import MistralClient from '@mistralai/mistralai'

const mistral = new MistralClient({
  apiKey: import.meta.env.VITE_MISTRAL_API_KEY
})

export default mistral 
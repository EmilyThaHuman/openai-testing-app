import Groq from 'groq-sdk'

const apiKey = import.meta.env.VITE_GROQ_API_KEY

const groq = new Groq({
  apiKey,
})

export default groq 
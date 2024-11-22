import { GoogleGenerativeAI } from '@google/generative-ai'

const palm = new GoogleGenerativeAI(import.meta.env.VITE_PALM_API_KEY)

export default palm 
// src/utils/openai.js
import { OpenAI } from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const openAI = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

export default openAI;

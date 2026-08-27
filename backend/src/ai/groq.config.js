import { ChatGroq } from '@langchain/groq';

export const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

export function createGroqChat({ temperature = 0.3 } = {}) {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: GROQ_MODEL,
    temperature,
  });
}
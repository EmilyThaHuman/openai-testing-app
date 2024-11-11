import OpenAI from 'openai';

let openaiInstance = null;

export const initializeOpenAI = (apiKey) => {
  if (!apiKey) return;
  
  openaiInstance = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
  return openaiInstance;
};

export const getOpenAIInstance = () => {
  if (!openaiInstance) {
    throw new Error('OpenAI not initialized. Call initializeOpenAI first.');
  }
  return openaiInstance;
};

export class AssistantService {
  static async createThread() {
    const openai = getOpenAIInstance();
    try {
      const thread = await openai.beta.threads.create();
      return thread;
    } catch (error) {
      console.error('Create Thread Error:', error);
      throw error;
    }
  }

  static async addMessage(threadId, content) {
    const openai = getOpenAIInstance();
    try {
      const message = await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content,
      });
      return message;
    } catch (error) {
      console.error('Add Message Error:', error);
      throw error;
    }
  }

  static async runAssistant(threadId, assistantId) {
    const openai = getOpenAIInstance();
    try {
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });
      return run;
    } catch (error) {
      console.error('Run Assistant Error:', error);
      throw error;
    }
  }

  static async getRunStatus(threadId, runId) {
    const openai = getOpenAIInstance();
    try {
      return await openai.beta.threads.runs.retrieve(threadId, runId);
    } catch (error) {
      console.error('Get Run Status Error:', error);
      throw error;
    }
  }

  static async getMessages(threadId) {
    const openai = getOpenAIInstance();
    try {
      const messages = await openai.beta.threads.messages.list(threadId);
      return messages.data;
    } catch (error) {
      console.error('Get Messages Error:', error);
      throw error;
    }
  }
} 
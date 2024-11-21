import { UnifiedOpenAIService } from './unifiedOpenAIService';

export const chatService = {
  async createThread() {
    try {
      return await UnifiedOpenAIService.threads.create();
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  },

  async getMessages(threadId) {
    try {
      const response = await UnifiedOpenAIService.threads.messages.list(threadId);
      return response.data;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  async sendMessage(threadId, message, fileIds = [], metadata = {}) {
    try {
      // Create message
      await UnifiedOpenAIService.threads.messages.create(threadId, {
        role: 'user',
        content: message,
        file_ids: fileIds,
        metadata
      });

      // Create run
      const run = await UnifiedOpenAIService.threads.runs.create(threadId, {
        assistant_id: process.env.VITE_OPENAI_ASSISTANT_ID
      });

      // Poll for completion
      let status = await this.pollRunStatus(threadId, run.id);

      if (status === 'completed') {
        // Get updated messages
        const messages = await this.getMessages(threadId);
        return messages;
      } else {
        throw new Error(`Run failed with status: ${status}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async pollRunStatus(threadId, runId, maxAttempts = 30, interval = 1000) {
    let attempts = 0;
    while (attempts < maxAttempts) {
      const run = await UnifiedOpenAIService.threads.runs.retrieve(threadId, runId);
      
      if (run.status === 'completed') {
        return 'completed';
      }
      
      if (['failed', 'cancelled', 'expired'].includes(run.status)) {
        return run.status;
      }

      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    }
    throw new Error('Run timed out');
  }
}; 
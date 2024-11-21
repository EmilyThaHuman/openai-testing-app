import OpenAI from 'openai';

class StreamLogger {
  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    });

    // Store the complete message as it's being built
    this.currentMessage = '';
  }

  logEvent(event, data) {
    const timestamp = new Date().toISOString();
    console.log('\n-----------------------------------');
    console.log(`${timestamp} | ${event}`);
    console.log('-----------------------------------');
    console.log(JSON.stringify(data, null, 2));
    console.log('-----------------------------------\n');
  }

  async createAndStreamResponse(threadId, userMessage) {
    try {
      // First, add the user message to the thread
      const message = await this.openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: userMessage,
      });

      this.logEvent('Message Created', message);

      // Create and start the run
      const run = await this.openai.beta.threads.runs.create(threadId, {
        assistant_id: import.meta.env.VITE_OPENAI_ASSISTANT_ID,
      });

      this.logEvent('Run Created', run);

      // Get the streaming response
      const stream =
        await this.openai.beta.threads.runs.createStreamingResponse(
          threadId,
          run.id
        );

      for await (const event of stream) {
        switch (event.type) {
          case 'thread.run.created':
            this.logEvent('Run Status: Created', event.data);
            break;

          case 'thread.run.queued':
            this.logEvent('Run Status: Queued', event.data);
            break;

          case 'thread.run.in_progress':
            this.logEvent('Run Status: In Progress', event.data);
            break;

          case 'thread.message.created':
            this.logEvent('Message Created', event.data);
            break;

          case 'thread.message.delta':
            if (
              event.data.delta.content &&
              event.data.delta.content[0]?.text?.value
            ) {
              const content = event.data.delta.content[0].text.value;
              this.currentMessage += content;

              // Log the delta
              this.logEvent('Content Delta', {
                delta: content,
                currentMessage: this.currentMessage,
              });
            }
            break;

          case 'thread.message.completed':
            this.logEvent('Message Completed', event.data);
            break;

          case 'thread.run.completed':
            this.logEvent('Run Completed', event.data);

            // Log final stats
            this.logEvent('Final Statistics', {
              totalTokens: event.data.usage?.total_tokens,
              completionTokens: event.data.usage?.completion_tokens,
              promptTokens: event.data.usage?.prompt_tokens,
            });
            break;

          case 'thread.run.failed':
            this.logEvent('Run Failed', {
              error: event.data.last_error,
              status: event.data.status,
            });
            break;
        }
      }

      return this.currentMessage;
    } catch (error) {
      this.logEvent('Error', {
        message: error.message,
        code: error.code,
        type: error.type,
      });
      throw error;
    }
  }
}

// Usage example:
async function main() {
  const logger = new StreamLogger();
  const threadId = 'your-thread-id';

  try {
    console.log('Starting streaming response...\n');

    const finalResponse = await logger.createAndStreamResponse(
      threadId,
      "What's the weather like today?"
    );

    console.log('\nFinal complete response:');
    console.log('========================');
    console.log(finalResponse);
    console.log('========================\n');
  } catch (error) {
    console.error('Error in main:', error);
  }
}

// Run the example
main();

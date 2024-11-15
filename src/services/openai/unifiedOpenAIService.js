/* eslint-disable no-case-declarations */
import OpenAI from 'openai';
import { createModuleLogger } from '@/services/logger';
import { ApiTracker } from '@/services/ApiTracker.jsx';

const logger = createModuleLogger('UnifiedOpenAIService');

let apiTracker;
try {
  apiTracker = new ApiTracker();
} catch (error) {
  console.error('Failed to initialize ApiTracker:', error);
  apiTracker = {
    startTracking: () => Date.now(),
    endTracking: () => {},
  };
}

let openaiInstance = null;

const checkInitialization = () => {
  if (!openaiInstance) {
    throw new Error(
      'OpenAI not initialized. Call initialize with API key first.'
    );
  }
  return openaiInstance;
};

const PRICING = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-32k': { input: 0.06, output: 0.12 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 },
};

const calculateCost = (model, usage) => {
  if (!usage || !PRICING[model]) return 0;

  const { prompt_tokens, completion_tokens } = usage;
  const { input, output } = PRICING[model];

  return (prompt_tokens * input + completion_tokens * output) / 1000;
};

const extractRateLimitInfo = headers => {
  return {
    remaining: parseInt(headers?.['x-ratelimit-remaining']) || null,
    limit: parseInt(headers?.['x-ratelimit-limit']) || null,
    reset: parseInt(headers?.['x-ratelimit-reset']) || null,
  };
};

const trackApiCall = async (endpoint, operation) => {
  if (!apiTracker?.startTracking) {
    logger.warn(
      'ApiTracker not properly initialized, continuing without tracking'
    );
    return await operation();
  }

  const startTime = apiTracker.startTracking(endpoint);
  const context = { endpoint };

  try {
    logger.debug(`Starting API call to ${endpoint}`, context);
    const result = await operation();

    const metadata = {
      model: result.model,
      usage: result.usage,
      cost: calculateCost(result.model, result.usage),
      rateLimit: extractRateLimitInfo(result.headers),
    };

    if (typeof apiTracker.endTracking === 'function') {
      apiTracker.endTracking(endpoint, startTime, 'success', metadata);
    }

    logger.debug(`Completed API call to ${endpoint}`, {
      ...context,
      duration: performance.now() - startTime,
      ...metadata,
    });

    return result;
  } catch (error) {
    const metadata = {
      errorCode: error.code,
      errorType: error.type,
      rateLimit: extractRateLimitInfo(error.headers),
    };

    if (typeof apiTracker.endTracking === 'function') {
      apiTracker.endTracking(endpoint, startTime, 'error', metadata);
    }

    logger.error(`API call failed for ${endpoint}`, error, {
      ...context,
      duration: performance.now() - startTime,
      ...metadata,
    });

    throw error;
  }
};

const trackUsageMetrics = async (endpoint, operation, params) => {
  return trackApiCall(endpoint, async () => {
    const result = await operation();

    // Track additional metrics if needed
    if (apiTracker?.storeMetrics) {
      apiTracker.storeMetrics(endpoint, {
        params,
        timestamp: Date.now(),
        status: 'success',
      });
    }

    return result;
  });
};

function handleStreamingResponse(response) {
  const eventLines = response.split('\n\n');
  let messageContent = '';

  eventLines.forEach(line => {
    if (line.startsWith('data:')) {
      const data = JSON.parse(line.slice(5));
      const eventType = data.object;

      switch (eventType) {
        case 'thread.run.created':
        case 'thread.run.queued':
        case 'thread.run.in_progress':
        case 'thread.run.completed':
          console.log(`[${eventType}]`, data);
          break;
        case 'thread.run.step.created':
        case 'thread.run.step.in_progress':
        case 'thread.run.step.completed':
          console.log(`[${eventType}]`, data.id, data.status);
          break;
        case 'thread.message.created':
        case 'thread.message.in_progress':
        case 'thread.message.completed':
          console.log(`[${eventType}]`, data.id, data.status);
          break;
        case 'thread.message.delta':
          const delta = data.delta.content[0];
          if (delta.type === 'text') {
            messageContent += delta.text.value;
            console.log(`[${eventType}]`, messageContent);
          }
          break;
        case 'done':
          console.log('[DONE]');
          handleFinalResponse(messageContent);
          break;
      }
    }
  });
}

function handleFinalResponse(finalResponse) {
  console.log('Final Response:', finalResponse);
  // Perform further actions with the final response
}

/**
 * UnifiedOpenAIService
 * - initialize(apiKey: string) -> void (sets the API key)
 * - beta.assistants.update(assistantId: string, params: object) -> Promise<Assistant>
 * - chat.create(params: object) -> Promise<Response>
 * - chat.createStream(params: object, onData: function) -> Promise<void>
 */
export const UnifiedOpenAIService = {
  /**
   * Initialization
   * - initialize(apiKey: string) -> void
   */
  initialize: apiKey => {
    if (!apiKey) return;
    openaiInstance = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  },

  /**
   * Set API Key
   * - setApiKey(apiKey: string) -> void
   */
  setApiKey: apiKey => {
    if (!apiKey) return;
    openaiInstance = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  },

  beta: {
    vectorStores: {
      fileBatches: {
        uploadAndPoll: async params => {
          try {
            const openai = checkInitialization();
            console.log('Uploading and polling file batch...');
            console.log('Params:', params);
            return await openai.beta.vectorStores.fileBatches.uploadAndPoll(
              params
            );
          } catch (error) {
            console.error('Error uploading and polling file batch:', error);
            throw error;
          }
        },
      },
    },
    assistants: {
      update: async (assistantId, params) => {
        const openai = checkInitialization();
        return await openai.beta.assistants.update(assistantId, params);
      },
    },
  },

  /**
   * Chat Completions API
   * - create({ model: string, messages: array, temperature?: number, ... }) -> Promise<Response>
   * - createStream({ model: string, messages: array, ... }, onData: function) -> Promise<void>
   */
  chat: {
    create: async params => {
      return trackApiCall('chat.create', async () => {
        const openai = checkInitialization();
        return await openai.chat.completions.create(params);
      });
    },

    createStream: async (params, onData) => {
      return trackApiCall('chat.createStream', async () => {
        const openai = checkInitialization();
        const stream = await openai.chat.completions.create({
          ...params,
          stream: true,
        });

        let tokenCount = 0;
        for await (const chunk of stream) {
          tokenCount += chunk.choices[0]?.delta?.content?.length || 0;
          onData(chunk);
        }

        return { tokenCount };
      });
    },
  },

  /**
   * Assistants API
   * - create({ model: string, name: string, instructions: string, tools?: array, metadata?: object }) -> Promise<Assistant>
   * - list() -> Promise<{ data: Assistant[] }>
   * - get(assistantId: string) -> Promise<Assistant>
   * - update(assistantId: string, params: object) -> Promise<Assistant>
   * - delete(assistantId: string) -> Promise<void>
   */

  assistants: {
    create: async params => {
      return trackApiCall('assistants.create', async () => {
        const openai = checkInitialization();
        console.log('Creating assistant...');

        // Log the assistant details and file IDs
        console.log('(create)-> Assistant Name:', params.name);
        console.log('(create)-> Assistant Model:', params.model);
        console.log('(create)-> Assistant Description:', params.description);
        console.log('(create)-> Assistant Instructions:', params.instructions);
        console.log('(create)-> File IDs:', params.fileIds);
        return await openai.beta.assistants.create(params);
      });
    },

    list: async () => {
      return trackApiCall('assistants.list', async () => {
        const openai = checkInitialization();
        console.log('Listing assistants...');
        return await openai.beta.assistants.list();
      });
    },

    get: async assistantId => {
      return trackApiCall(`assistants.get.${assistantId}`, async () => {
        const openai = checkInitialization();
        console.log('Getting assistant...');
        console.log('(get)-> Assistant ID:', assistantId);
        return await openai.beta.assistants.retrieve(assistantId);
      });
    },

    update: async (assistantId, params) => {
      return trackApiCall(`assistants.update.${assistantId}`, async () => {
        const openai = checkInitialization();
        console.log('Updating assistant...');
        console.log('(update)-> Assistant ID:', assistantId);
        console.log('(update)-> Params:', params);
        return await openai.beta.assistants.update(assistantId, params);
      });
    },

    delete: async assistantId => {
      return trackApiCall(`assistants.delete.${assistantId}`, async () => {
        const openai = checkInitialization();
        console.log('Deleting assistant...');
        console.log('(delete)-> Assistant ID:', assistantId);
        return await openai.beta.assistants.del(assistantId);
      });
    },
  },
  /**
   * Threads API
   * - create() -> Promise<Thread>
   * - list() -> Promise<{ data: Thread[] }> (from localStorage)
   * - get(threadId: string) -> Promise<Thread & { messages: Message[] }>
   * - update(threadId: string, params: object) -> Promise<Thread>
   * - delete(threadId: string) -> Promise<void>
   *
   * Messages:
   * - create(threadId: string, content: string) -> Promise<Message>
   * - list(threadId: string) -> Promise<{ data: Message[] }>
   * - get(threadId: string, messageId: string) -> Promise<Message>
   * - update(threadId: string, messageId: string, params: object) -> Promise<Message>
   *
   * Runs:
   * - create(threadId: string, assistantId: string) -> Promise<Run>
   * - createAndRun(assistantId: string, params: object) -> Promise<Run>
   * - createAndStreamRun(assistantId: string, params: object) -> Promise<Stream>
   * - createAndStreamRunWithFunctionCalling(assistantId: string, params: object) -> Promise<Stream>
   * - get(threadId: string, runId: string) -> Promise<Run>
   * - list(threadId: string) -> Promise<{ data: Run[] }>
   * - update(threadId: string, runId: string, params: object) -> Promise<Run>
   * - submitToolOutputs(threadId: string, runId: string, params: object) -> Promise<Run>
   * - cancel(threadId: string, runId: string) -> Promise<Run>
   * - steps.list(threadId: string, runId: string) -> Promise<{ data: Step[] }>
   * - steps.get(threadId: string, runId: string, stepId: string) -> Promise<Step>
   */
  threads: {
    create: async messages => {
      return trackApiCall('threads.create', async () => {
        console.log('Creating thread...');
        const openai = checkInitialization();
        const thread = await openai.beta.threads.create({
          messages: messages || [],
        });
        // Store the new thread in localStorage
        const threads = JSON.parse(
          localStorage.getItem('openai_threads') || '[]'
        );
        threads.push({
          id: thread.id,
          created_at: new Date().toISOString(),
          assistant_id: null,
        });
        localStorage.setItem('openai_threads', JSON.stringify(threads));
        return thread;
      });
    },

    list: async () => {
      // Get threads from localStorage
      const threads = JSON.parse(
        localStorage.getItem('openai_threads') || '[]'
      );
      console.log('THREADS RETREIVED FROM LOCAL STORAGE', threads);
      return { data: threads };
    },

    retrieve: async threadId => {
      return trackApiCall(`threads.retrieve.${threadId}`, async () => {
        console.log('Getting thread...');
        console.log('(retrieve)-> Thread ID:', threadId);
        try {
          const openai = checkInitialization();
          const thread = await openai.beta.threads.retrieve(threadId);
          const messages = await openai.beta.threads.messages.list(threadId);
          return { ...thread, messages: messages.data.reverse() };
        } catch (error) {
          console.error('OpenAI API Error:', error);
          throw error;
        }
      });
    },

    update: async (threadId, params) => {
      return trackApiCall(`threads.update.${threadId}`, async () => {
        console.log('Updating thread...');
        console.log('(update)-> Thread ID:', threadId);
        console.log('(update)-> Params:', params);
        try {
          const openai = checkInitialization();
          return await openai.beta.threads.update(threadId, params);
        } catch (error) {
          console.error('OpenAI API Error:', error);
          throw error;
        }
      });
    },

    delete: async threadId => {
      return trackApiCall(`threads.delete.${threadId}`, async () => {
        console.log('Deleting thread...');
        console.log('(delete)-> Thread ID:', threadId);
        try {
          const openai = checkInitialization();
          await openai.beta.threads.del(threadId);
          // Remove from localStorage
          const threads = JSON.parse(
            localStorage.getItem('openai_threads') || '[]'
          );
          const updatedThreads = threads.filter(t => t.id !== threadId);
          localStorage.setItem(
            'openai_threads',
            JSON.stringify(updatedThreads)
          );
        } catch (error) {
          console.error('OpenAI API Error:', error);
          throw error;
        }
      });
    },

    messages: {
      create: async (threadId, params) => {
        return trackApiCall(`threads.messages.create.${threadId}`, async () => {
          console.log('Creating message...');
          console.log('(create)-> Thread ID:', threadId);
          console.log('(create)-> Params:', params);
          try {
            const openai = checkInitialization();
            return await openai.beta.threads.messages.create(threadId, {
              role: 'user',
              content: params.content,
              // file_ids: params.file_ids,
            });
          } catch (error) {
            console.error('OpenAI API Error:', error);
            throw error;
          }
        });
      },

      list: async threadId => {
        return trackApiCall(`threads.messages.list.${threadId}`, async () => {
          console.log('Listing messages...');
          console.log('(list)-> Thread ID:', threadId);
          try {
            const openai = checkInitialization();
            const response = await openai.beta.threads.messages.list(threadId);
            return { data: response.data };
          } catch (error) {
            console.error('OpenAI API Error:', error);
            throw error;
          }
        });
      },

      get: async (threadId, messageId) => {
        return trackApiCall(
          `threads.messages.get.${threadId}.${messageId}`,
          async () => {
            console.log('Getting message...');
            console.log('(get)-> Thread ID:', threadId);
            console.log('(get)-> Message ID:', messageId);
            try {
              const openai = checkInitialization();
              return await openai.beta.threads.messages.retrieve(
                threadId,
                messageId
              );
            } catch (error) {
              console.error('OpenAI API Error:', error);
              throw error;
            }
          }
        );
      },

      update: async (threadId, messageId, params) => {
        return trackApiCall(
          `threads.messages.update.${threadId}.${messageId}`,
          async () => {
            console.log('Updating message...');
            console.log('(update)-> Thread ID:', threadId);
            console.log('(update)-> Message ID:', messageId);
            console.log('(update)-> Params:', params);
            try {
              const openai = checkInitialization();
              return await openai.beta.threads.messages.update(
                threadId,
                messageId,
                params
              );
            } catch (error) {
              console.error('OpenAI API Error:', error);
              throw error;
            }
          }
        );
      },

      submitFeedback: async (threadId, messageId, type) => {
        return trackApiCall(
          `threads.messages.submitFeedback.${threadId}.${messageId}`,
          async () => {
            console.log('Submitting feedback...');
            console.log('(submitFeedback)-> Thread ID:', threadId);
            console.log('(submitFeedback)-> Message ID:', messageId);
            console.log('(submitFeedback)-> Type:', type);
            try {
              const openai = checkInitialization();
              return await openai.beta.threads.messages.submitFeedback(
                threadId,
                messageId,
                type
              );
            } catch (error) {
              console.error('OpenAI API Error:', error);
              throw error;
            }
          }
        );
      },
    },

    runs: {
      create: async (threadId, params) => {
        try {
          console.log('Creating run...');
          console.log('(create)-> Thread ID:', threadId);
          console.log('(create)-> Assistant ID:', params.assistantId);
          console.log('(create)-> Streaming:', params.stream);

          const openai = checkInitialization();
          const runStream = await openai.beta.threads.runs.create(threadId, {
            assistant_id: params.assistantId,
            stream: params.stream,
          });

          // Do not consume the runStream here
          // Just return it for consumption elsewhere
          return runStream;
        } catch (error) {
          console.error('OpenAI API Error:', error);
          throw error;
        }
      },
      // create: async (threadId, params) => {
      //   try {
      //     console.log('Creating run...');
      //     console.log('(create)-> Thread ID:', threadId);
      //     console.log('(create)-> Assistant ID:', params.assistantId);
      //     console.log('(create)-> Streaming:', params.stream);

      //     const openai = checkInitialization();
      //     const runStream = await openai.beta.threads.runs.create(threadId, {
      //       assistant_id: params.assistantId,
      //       stream: params.stream,
      //     });

      //     // Log the run status onChange
      //     // handleStreamingResponse(runStream);

      //     let run_id;

      //     for await (const event of runStream) {
      //       if (event.type === 'run_created') {
      //         run_id = event.run.id;
      //       }
      //     }

      // for await (const event of runStream) {
      //   switch (event.type) {
      //     case 'thread.run.created':
      //       await await logOpenAIEvent('Run Status: Created', event.data);
      //       break;

      //     case 'thread.run.queued':
      //       await logOpenAIEvent('Run Status: Queued', event.data);
      //       break;

      //     case 'thread.run.in_progress':
      //       await logOpenAIEvent('Run Status: In Progress', event.data);
      //       break;

      //     case 'thread.message.created':
      //       await logOpenAIEvent('Message Created', event.data);
      //       break;

      //     case 'thread.message.delta':
      //       if (
      //         event.data.delta.content &&
      //         event.data.delta.content[0]?.text?.value
      //       ) {
      //         const content = event.data.delta.content[0].text.value;
      //         this.currentMessage += content;

      //         // Log the delta
      //         await logOpenAIEvent('Content Delta', {
      //           delta: content,
      //           currentMessage: this.currentMessage,
      //         });
      //       }
      //       break;

      //     case 'thread.message.completed':
      //       await logOpenAIEvent('Message Completed', event.data);
      //       break;

      //     case 'thread.run.completed':
      //       await logOpenAIEvent('Run Completed', event.data);

      //       // Log final stats
      //       await logOpenAIEvent('Final Statistics', {
      //         totalTokens: event.data.usage?.total_tokens,
      //         completionTokens: event.data.usage?.completion_tokens,
      //         promptTokens: event.data.usage?.prompt_tokens,
      //       });
      //       break;

      //     case 'thread.run.failed':
      //       await logOpenAIEvent('Run Failed', {
      //         error: event.data.last_error,
      //         status: event.data.status,
      //       });
      //       break;
      //   }
      // }

      //     let runStatus = await openai.beta.threads.runs.retrieve(
      //       threadId,
      //       run_id
      //     );
      //     console.log(runStatus);

      //     while (['in_progress', 'queued'].includes(runStatus.status)) {
      //       await new Promise(resolve => setTimeout(resolve, 1000));
      //       runStatus = await openai.beta.threads.runs.retrieve(
      //         threadId,
      //         run_id
      //       );
      //     }

      //     return runStatus;
      //   } catch (error) {
      //     console.error('OpenAI API Error:', error);
      //     throw error;
      //   }
      // },

      createAndRun: async (assistantId, params) => {
        console.log('Creating and running...');
        console.log('(createAndRun)-> Assistant ID:', assistantId);
        console.log('(createAndRun)-> Params:', params);
        try {
          const openai = checkInitialization();
          const run = await openai.beta.threads.createAndRun({
            assistant_id: assistantId,
            thread: {
              messages: [
                {
                  role: 'user',
                  content: params.content,
                },
              ],
            },
          });
          return run;
        } catch (error) {
          console.error('Error creating and running:', error);
          throw error;
        }
      },

      createAndStreamRun: async (assistantId, params) => {
        console.log('Creating and streaming run...');
        console.log('(createAndStreamRun)-> Assistant ID:', assistantId);
        console.log('(createAndStreamRun)-> Params:', params);
        try {
          const openai = checkInitialization();
          const stream = await openai.beta.threads.createAndRun({
            assistant_id: assistantId,
            thread: {
              messages: [
                {
                  role: 'user',
                  content: params.content,
                },
              ],
            },
            stream: true,
          });
          return stream;
        } catch (error) {
          console.error('Error creating and streaming run:', error);
          throw error;
        }
      },

      createAndStreamRunWithFunctionCalling: async (assistantId, params) => {
        console.log('Creating and streaming run with function calling...');
        console.log(
          '(createAndStreamRunWithFunctionCalling)-> Assistant ID:',
          assistantId
        );
        console.log(
          '(createAndStreamRunWithFunctionCalling)-> Params:',
          params
        );
        try {
          const openai = checkInitialization();
          const stream = await openai.beta.threads.createAndRun({
            assistant_id: assistantId,
            thread: {
              messages: [
                {
                  role: 'user',
                  content: params.content,
                },
              ],
            },
            tools: params.tools,
            stream: true,
          });
          for await (const event of stream) {
            console.log(event);
          }
          return stream;
        } catch (error) {
          console.error(
            'Error creating and streaming run with function calling:',
            error
          );
          throw error;
        }
      },

      retrieve: async (threadId, runId) => {
        console.log('Getting run...');
        console.log('(get)-> Thread ID:', threadId);
        console.log('(get)-> Run ID:', runId);
        try {
          const openai = checkInitialization();
          return await openai.beta.threads.runs.retrieve(threadId, runId);
        } catch (error) {
          console.error('OpenAI API Error:', error);
          throw error;
        }
      },

      update: async (threadId, runId, params) => {
        console.log('Updating run...');
        console.log('(update)-> Thread ID:', threadId);
        console.log('(update)-> Run ID:', runId);
        console.log('(update)-> Params:', params);
        try {
          const openai = checkInitialization();
          return await openai.beta.threads.runs.update(threadId, runId, params);
        } catch (error) {
          console.error('OpenAI API Error:', error);
          throw error;
        }
      },

      list: async threadId => {
        console.log('Listing runs...');
        console.log('(list)-> Thread ID:', threadId);
        try {
          const openai = checkInitialization();
          const response = await openai.beta.threads.runs.list(threadId);
          return { data: response.data };
        } catch (error) {
          console.error('OpenAI API Error:', error);
          throw error;
        }
      },

      submitToolOutputs: async (threadId, runId, params) => {
        console.log('Submitting tool outputs...');
        console.log('(submitToolOutputs)-> Thread ID:', threadId);
        console.log('(submitToolOutputs)-> Run ID:', runId);
        console.log('(submitToolOutputs)-> Params:', params);
        try {
          const openai = checkInitialization();
          return await openai.beta.threads.runs.submitToolOutputs(
            threadId,
            runId,
            params
          );
        } catch (error) {
          console.error('OpenAI API Error:', error);
          throw error;
        }
      },

      cancel: async (threadId, runId) => {
        console.log('Cancelling run...');
        console.log('(cancel)-> Thread ID:', threadId);
        console.log('(cancel)-> Run ID:', runId);
        try {
          const openai = checkInitialization();
          return await openai.beta.threads.runs.cancel(threadId, runId);
        } catch (error) {
          console.error('OpenAI API Error:', error);
          throw error;
        }
      },

      steps: {
        list: async (threadId, runId) => {
          console.log('Listing run steps...');
          console.log('(list)-> Thread ID:', threadId);
          console.log('(list)-> Run ID:', runId);
          try {
            const openai = checkInitialization();
            const response = await openai.beta.threads.runs.steps.list(
              threadId,
              runId
            );
            return { data: response.data };
          } catch (error) {
            console.error('OpenAI API Error:', error);
            throw error;
          }
        },

        get: async (threadId, runId, stepId) => {
          console.log('Getting run step...');
          console.log('(get)-> Thread ID:', threadId);
          console.log('(get)-> Run ID:', runId);
          console.log('(get)-> Step ID:', stepId);
          try {
            const openai = checkInitialization();
            return await openai.beta.threads.runs.steps.retrieve(
              threadId,
              runId,
              stepId
            );
          } catch (error) {
            console.error('OpenAI API Error:', error);
            throw error;
          }
        },
      },
    },
  },

  // Messages
  messages: {
    create: async (threadId, content) => {
      console.log('Creating message...');
      console.log('(create)-> Thread ID:', threadId);
      console.log('(create)-> Content:', content);
      try {
        const openai = checkInitialization();
        return await openai.beta.threads.messages.create(threadId, {
          role: 'user',
          content,
        });
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },

    list: async threadId => {
      console.log('Listing messages...');
      console.log('(list)-> Thread ID:', threadId);
      try {
        const openai = checkInitialization();
        const response = await openai.beta.threads.messages.list(threadId);
        return { data: response.data };
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },

    get: async (threadId, messageId) => {
      console.log('Getting message...');
      console.log('(get)-> Thread ID:', threadId);
      console.log('(get)-> Message ID:', messageId);
      try {
        const openai = checkInitialization();
        return await openai.beta.threads.messages.retrieve(threadId, messageId);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },

    update: async (threadId, messageId, params) => {
      console.log('Updating message...');
      console.log('(update)-> Thread ID:', threadId);
      console.log('(update)-> Message ID:', messageId);
      console.log('(update)-> Params:', params);
      try {
        const openai = checkInitialization();
        return await openai.beta.threads.messages.update(
          threadId,
          messageId,
          params
        );
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
  },

  /**
   * Audio API
   * - transcribe(file: File, model: string, options?: object) -> Promise<Transcription>
   * - translate(file: File, model: string) -> Promise<Translation>
   */
  audio: {
    transcribe: async (file, model, options = {}) => {
      const openai = checkInitialization();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', model);
      return await openai.audio.transcriptions.create(formData);
    },

    translate: async (file, model) => {
      const openai = checkInitialization();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', model);
      return await openai.audio.translations.create(formData);
    },
  },

  /**
   * Images API
   * - generate({ prompt: string, n?: number, size?: string, ... }) -> Promise<{ data: Image[] }>
   * - edit({ image: File, mask?: File, prompt: string, ... }) -> Promise<{ data: Image[] }>
   * - createVariation({ image: File, n?: number, size?: string }) -> Promise<{ data: Image[] }>
   */
  images: {
    generate: async params => {
      const openai = checkInitialization();
      const response = await openai.images.generate(params);
      return {
        data: response.data,
      };
    },

    edit: async params => {
      const openai = checkInitialization();
      const response = await openai.images.edit(params);
      return {
        data: response.data,
      };
    },

    createVariation: async params => {
      const openai = checkInitialization();
      const response = await openai.images.createVariation(params);
      return {
        data: response.data,
      };
    },
  },

  /**
   * Files API
   * - list() -> Promise<{ data: File[] }>
   * - get(fileId: string) -> Promise<File>
   * - delete(fileId: string) -> Promise<void>
   * - getContent(fileId: string) -> Promise<string>
   * - upload(file: File, purpose?: string) -> Promise<File>
   */
  files: {
    create: async params => {
      return trackUsageMetrics(
        'files.create',
        async () => {
          const openai = checkInitialization();
          return await openai.files.create(params);
        },
        params
      );
    },
    delete: async fileId => {
      return trackUsageMetrics(
        `files.delete.${fileId}`,
        async () => {
          const openai = checkInitialization();
          return await openai.files.delete(fileId);
        },
        { fileId }
      );
    },
    list: async () => {
      return trackUsageMetrics(
        'files.list',
        async () => {
          const openai = checkInitialization();
          return await openai.files.list();
        },
        {}
      );
    },

    get: async fileId => {
      console.log('Getting file...');
      console.log('(get)-> File ID:', fileId);
      try {
        const openai = checkInitialization();
        return await openai.files.retrieve(fileId);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },

    getContent: async fileId => {
      console.log('Getting file content...');
      console.log('(getContent)-> File ID:', fileId);
      try {
        const openai = checkInitialization();
        return await openai.files.retrieveContent(fileId);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },

    upload: async (file, purpose = 'assistants') => {
      console.log('Uploading file to OpenAI');
      try {
        const openai = checkInitialization();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', purpose);

        const response = await openai.files.create({
          file: file,
          purpose: purpose,
        });

        return response;
      } catch (error) {
        console.error('OpenAI File Upload Error:', error);
        throw error;
      }
    },
  },

  /**
   * Batches API
   * - create(params: object) -> Promise<Batch>
   * - get(batchId: string) -> Promise<Batch>
   * - list() -> Promise<{ data: Batch[] }>
   */
  batches: {
    create: async params => {
      console.log('Creating batch...');
      console.log('(create)-> Params:', params);
      try {
        const openai = checkInitialization();
        return await openai.batches.create(params);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
    get: async batchId => {
      console.log('Getting batch...');
      console.log('(get)-> Batch ID:', batchId);
      try {
        const openai = checkInitialization();
        return await openai.batches.retrieve(batchId);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
    list: async () => {
      console.log('Listing batches...');
      try {
        const openai = checkInitialization();
        const response = await openai.batches.list();
        return { data: response.data };
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
  },

  /**
   * Vector Stores API
   * - create(params: object) -> Promise<VectorStore>
   * - get(vectorStoreId: string) -> Promise<VectorStore>
   * - delete(vectorStoreId: string) -> Promise<void>
   * - list() -> Promise<{ data: VectorStore[] }>
   * - update(vectorStoreId: string, params: object) -> Promise<VectorStore>
   *
   * Files:
   * - create(vectorStoreId: string, params: object) -> Promise<VectorStoreFile>
   * - get(vectorStoreId: string, fileId: string) -> Promise<VectorStoreFile>
   * - delete(vectorStoreId: string, fileId: string) -> Promise<void>
   * - list(vectorStoreId: string) -> Promise<{ data: VectorStoreFile[] }>
   */
  vectorStores: {
    create: async params => {
      console.log('Creating vector store...');
      console.log('(create)-> Params:', params);
      try {
        const openai = checkInitialization();
        return await openai.beta.vectorStores.create(params);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
    get: async vectorStoreId => {
      console.log('Getting vector store...');
      console.log('(get)-> Vector Store ID:', vectorStoreId);
      try {
        const openai = checkInitialization();
        return await openai.beta.vectorStores.retrieve(vectorStoreId);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
    delete: async vectorStoreId => {
      console.log('Deleting vector store...');
      console.log('(delete)-> Vector Store ID:', vectorStoreId);
      try {
        const openai = checkInitialization();
        return await openai.beta.vectorStores.del(vectorStoreId);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
    list: async () => {
      console.log('Listing vector stores...');
      try {
        const openai = checkInitialization();
        const response = await openai.beta.vectorStores.list();
        return { data: response.data };
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
    update: async (vectorStoreId, params) => {
      console.log('Updating vector store...');
      console.log('(update)-> Vector Store ID:', vectorStoreId);
      console.log('(update)-> Params:', params);
      try {
        const openai = checkInitialization();
        return await openai.beta.vectorStores.update(vectorStoreId, params);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
  },

  /**
   * Vector Store Files API
   * - create(vectorStoreId: string, params: object) -> Promise<VectorStoreFile>
   * - get(vectorStoreId: string, fileId: string) -> Promise<VectorStoreFile>
   * - delete(vectorStoreId: string, fileId: string) -> Promise<void>
   * - list(vectorStoreId: string) -> Promise<{ data: VectorStoreFile[] }>
   */
  vectorStoreFiles: {
    create: async (vectorStoreId, params) => {
      console.log('Creating vector store file...');
      console.log('(create)-> Vector Store ID:', vectorStoreId);
      console.log('(create)-> Params:', params);
      try {
        const openai = checkInitialization();
        return await openai.beta.vectorStores.files.create(vectorStoreId, {
          file_id: params.file_id,
          chunking_strategy: params.chunking_strategy,
        });
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
    get: async (vectorStoreId, fileId) => {
      console.log('Getting vector store file...');
      console.log('(get)-> Vector Store ID:', vectorStoreId);
      console.log('(get)-> File ID:', fileId);
      try {
        const openai = checkInitialization();
        return await openai.beta.vectorStores.files.retrieve(
          vectorStoreId,
          fileId
        );
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
    delete: async (vectorStoreId, fileId) => {
      console.log('Deleting vector store file...');
      console.log('(delete)-> Vector Store ID:', vectorStoreId);
      console.log('(delete)-> File ID:', fileId);
      try {
        const openai = checkInitialization();
        return await openai.beta.vectorStores.files.del(vectorStoreId, fileId);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
    list: async vectorStoreId => {
      console.log('Listing vector store files...');
      console.log('(list)-> Vector Store ID:', vectorStoreId);
      try {
        const openai = checkInitialization();
        const response =
          await openai.beta.vectorStores.files.list(vectorStoreId);
        return { data: response.data };
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
  },

  /**
   * Embeddings API
   * - create({ model: string, input: string | string[] }) -> Promise<Embedding>
   */
  embeddings: {
    create: async params => {
      return trackUsageMetrics(
        'embeddings.create',
        async () => {
          const openai = checkInitialization();
          return await openai.embeddings.create(params);
        },
        params
      );
    },
  },

  /**
   * Models API
   * - list() -> Promise<{ data: Model[] }>
   * - get(modelId: string) -> Promise<Model>
   */
  models: {
    list: async () => {
      return trackUsageMetrics(
        'models.list',
        async () => {
          const openai = checkInitialization();
          return await openai.models.list();
        },
        {}
      );
    },
    retrieve: async modelId => {
      return trackUsageMetrics(
        `models.retrieve.${modelId}`,
        async () => {
          const openai = checkInitialization();
          return await openai.models.retrieve(modelId);
        },
        { modelId }
      );
    },
  },

  // Moderation
  moderation: {
    create: async params => {
      console.log('Creating moderation...');
      console.log('(create)-> Params:', params);
      try {
        const openai = checkInitialization();
        return await openai.moderations.create(params);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
  },

  // Fine-tuning
  fineTuning: {
    create: async params => {
      console.log('Creating fine-tuning job...');
      console.log('(create)-> Params:', params);
      try {
        const openai = checkInitialization();
        return await openai.fineTuning.jobs.create(params);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },

    list: async () => {
      console.log('Listing fine-tuning jobs...');
      try {
        const openai = checkInitialization();
        const response = await openai.fineTuning.jobs.list();
        return {
          data: response.data,
        };
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },

    get: async jobId => {
      const openai = checkInitialization();
      console.log('Getting fine-tuning job...');
      console.log('(get)-> Job ID:', jobId);
      try {
        const openai = checkInitialization();
        return await openai.fineTuning.jobs.retrieve(jobId);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },

    cancel: async jobId => {
      const openai = checkInitialization();
      console.log('Cancelling fine-tuning job...');
      console.log('(cancel)-> Job ID:', jobId);
      try {
        const openai = checkInitialization();
        return await openai.fineTuning.jobs.cancel(jobId);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
  },

  /**
   * Completions API
   * - create({ model: string, prompt: string, ... }) -> Promise<Completion>
   * - createStream({ model: string, prompt: string, ... }, onChunk: function) -> Promise<void>
   */
  completions: {
    create: async params => {
      console.log('Creating completion...');
      console.log('(create)-> Params:', params);
      try {
        const openai = checkInitialization();
        return await openai.completions.create(params);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
    createStream: async (params, onChunk) => {
      console.log('Creating completion stream...');
      console.log('(createStream)-> Params:', params);
      try {
        const openai = checkInitialization();
        const stream = await openai.chat.completions.create({
          ...params,
          stream: true,
        });
        for await (const chunk of stream) {
          onChunk(chunk);
        }
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    },
  },
};

apiTracker.storeMetrics = function (endpoint, metrics) {
  const existingMetrics = this.metrics.details?.get(endpoint) || [];
  this.metrics.details = this.metrics.details || new Map();

  const timestamp = Date.now();
  existingMetrics.push({
    timestamp,
    ...metrics,
  });

  // Keep only last 100 detailed metrics per endpoint
  if (existingMetrics.length > 100) {
    existingMetrics.shift();
  }

  this.metrics.details.set(endpoint, existingMetrics);
};

// Add method to get endpoint-specific metrics
apiTracker.getEndpointMetrics = function (prefix) {
  const endpointMetrics = {};

  Array.from(this.metrics.calls.keys())
    .filter(key => key.startsWith(prefix))
    .forEach(key => {
      endpointMetrics[key] = {
        calls: this.metrics.calls.get(key) || 0,
        latency: this.metrics.latency.get(key) || { average: 0 },
        errors: this.metrics.errors.get(key) || [],
        details: this.metrics.details?.get(key) || [],
      };
    });

  return endpointMetrics;
};

// Add usage tracking methods
apiTracker.getModelUsage = function (model, timeRange = '24h') {
  const metrics = this.metrics.details?.get('chat.create') || [];
  const cutoff = Date.now() - getTimeRangeMs(timeRange);

  return metrics
    .filter(m => m.timestamp > cutoff && m.model === model)
    .reduce(
      (acc, m) => ({
        totalTokens: acc.totalTokens + (m.totalTokens || 0),
        totalCost: acc.totalCost + (m.cost || 0),
        calls: acc.calls + 1,
        errors: acc.errors + (m.status === 'error' ? 1 : 0),
      }),
      { totalTokens: 0, totalCost: 0, calls: 0, errors: 0 }
    );
};

const getTimeRangeMs = range => {
  const ranges = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  return ranges[range] || ranges['24h'];
};

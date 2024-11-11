import OpenAI from "openai";

let openaiInstance = null;

const checkInitialization = () => {
  if (!openaiInstance) {
    throw new Error(
      "OpenAI not initialized. Call initialize with API key first."
    );
  }
  return openaiInstance;
};

export const UnifiedOpenAIService = {
  /**
   * Initialization
   * - initialize(apiKey: string) -> void
   */
  initialize: (apiKey) => {
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
  setApiKey: (apiKey) => {
    if (!apiKey) return;
    openaiInstance = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  },

  /**
   * Chat Completions API
   * - create({ model: string, messages: array, temperature?: number, ... }) -> Promise<Response>
   * - createStream({ model: string, messages: array, ... }, onData: function) -> Promise<void>
   */
  chat: {
    create: async (data) => {
      try {
        const openai = checkInitialization();
        const response = await openai.chat.completions.create(data);
        return response;
      } catch (error) {
        console.error("OpenAI API Error:", error);
        throw error;
      }
    },

    createStream: async (data, onData) => {
      try {
        const openai = checkInitialization();
        const stream = await openai.chat.completions.create({
          ...data,
          stream: true,
        });

        for await (const chunk of stream) {
          onData(chunk);
        }
      } catch (error) {
        console.error("OpenAI Stream Error:", error);
        throw error;
      }
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
    create: async (params) => {
      const openai = checkInitialization();
      console.log("Creating assistant...");

      // Log the assistant details and file IDs
      console.log("(create)-> Assistant Name:", params.name);
      console.log("(create)-> Assistant Model:", params.model);
      console.log("(create)-> Assistant Description:", params.description);
      console.log("(create)-> Assistant Instructions:", params.instructions);
      console.log("(create)-> File IDs:", params.fileIds);
      const requestBody = {
        model: params.model,
        name: params.name,
        instructions: params.instructions,
        tools: params.tools || [],
        metadata: params.metadata || {},
      };
      return await openai.beta.assistants.create(requestBody);
    },

    list: async () => {
      const openai = checkInitialization();
      const response = await openai.beta.assistants.list();
      return { data: response.data };
    },

    get: async (assistantId) => {
      const openai = checkInitialization();
      return await openai.beta.assistants.retrieve(assistantId);
    },

    update: async (assistantId, params) => {
      const openai = checkInitialization();
      return await openai.beta.assistants.update(assistantId, params);
    },

    delete: async (assistantId) => {
      const openai = checkInitialization();
      return await openai.beta.assistants.del(assistantId);
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
   * - get(threadId: string, runId: string) -> Promise<Run>
   * - list(threadId: string) -> Promise<{ data: Run[] }>
   * - update(threadId: string, runId: string, params: object) -> Promise<Run>
   * - submitToolOutputs(threadId: string, runId: string, params: object) -> Promise<Run>
   * - cancel(threadId: string, runId: string) -> Promise<Run>
   * - steps.list(threadId: string, runId: string) -> Promise<{ data: Step[] }>
   * - steps.get(threadId: string, runId: string, stepId: string) -> Promise<Step>
   */
  threads: {
    create: async (messages) => {
      console.log("Creating thread...");
      const openai = checkInitialization();
      const thread = await openai.beta.threads.create({
        messages: messages || [],
      });
      // Store the new thread in localStorage
      const threads = JSON.parse(
        localStorage.getItem("openai_threads") || "[]"
      );
      threads.push({
        id: thread.id,
        created_at: new Date().toISOString(),
        assistant_id: null,
      });
      localStorage.setItem("openai_threads", JSON.stringify(threads));
      return thread;
    },

    list: async () => {
      // Get threads from localStorage
      const threads = JSON.parse(
        localStorage.getItem("openai_threads") || "[]"
      );
      return { data: threads };
    },

    get: async (threadId) => {
      const openai = checkInitialization();
      const thread = await openai.beta.threads.retrieve(threadId);
      const messages = await openai.beta.threads.messages.list(threadId);
      console.log("messages", messages);
      console.log("thread", thread);
      return { ...thread, messages: messages.data.reverse() };
    },

    update: async (threadId, params) => {
      const openai = checkInitialization();
      return await openai.beta.threads.update(threadId, params);
    },

    delete: async (threadId) => {
      const openai = checkInitialization();
      await openai.beta.threads.del(threadId);
      // Remove from localStorage
      const threads = JSON.parse(
        localStorage.getItem("openai_threads") || "[]"
      );
      const updatedThreads = threads.filter((t) => t.id !== threadId);
      localStorage.setItem("openai_threads", JSON.stringify(updatedThreads));
    },

    messages: {
      create: async (threadId, content) => {
        const openai = checkInitialization();
        return await openai.beta.threads.messages.create(threadId, {
          role: "user",
          content,
        });
      },

      list: async (threadId) => {
        const openai = checkInitialization();
        const response = await openai.beta.threads.messages.list(threadId);
        return { data: response.data };
      },

      get: async (threadId, messageId) => {
        const openai = checkInitialization();
        return await openai.beta.threads.messages.retrieve(threadId, messageId);
      },

      update: async (threadId, messageId, params) => {
        const openai = checkInitialization();
        return await openai.beta.threads.messages.update(
          threadId,
          messageId,
          params
        );
      },

      submitFeedback: async (threadId, messageId, type) => {
        const openai = checkInitialization();
        // return await openai.beta.threads.messages.submitFeedback(
        //   threadId,
        //   messageId,
        //   type
        // );
        console.log("submitFeedback", threadId, messageId, type);
        return null;
      },
    },

    runs: {
      create: async (threadId, assistantId) => {
        console.log("Creating run...");
        console.log("(create)-> Thread ID:", threadId);
        console.log("(create)-> Assistant ID:", assistantId);

        const openai = checkInitialization();
        const run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: assistantId,
        });

        let runStatus = await openai.beta.threads.runs.retrieve(
          threadId,
          run.id
        );
        while (["in_progress", "queued"].includes(runStatus.status)) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        }

        return runStatus;
      },

      get: async (threadId, runId) => {
        const openai = checkInitialization();
        return await openai.beta.threads.runs.retrieve(threadId, runId);
      },

      update: async (threadId, runId, params) => {
        const openai = checkInitialization();
        return await openai.beta.threads.runs.update(threadId, runId, params);
      },

      list: async (threadId) => {
        const openai = checkInitialization();
        const response = await openai.beta.threads.runs.list(threadId);
        return { data: response.data };
      },

      submitToolOutputs: async (threadId, runId, params) => {
        const openai = checkInitialization();
        return await openai.beta.threads.runs.submitToolOutputs(
          threadId,
          runId,
          params
        );
      },

      cancel: async (threadId, runId) => {
        const openai = checkInitialization();
        return await openai.beta.threads.runs.cancel(threadId, runId);
      },

      steps: {
        list: async (threadId, runId) => {
          const openai = checkInitialization();
          const response = await openai.beta.threads.runs.steps.list(
            threadId,
            runId
          );
          return { data: response.data };
        },

        get: async (threadId, runId, stepId) => {
          const openai = checkInitialization();
          return await openai.beta.threads.runs.steps.retrieve(
            threadId,
            runId,
            stepId
          );
        },
      },
    },
  },

  // Messages
  messages: {
    create: async (threadId, content) => {
      const openai = checkInitialization();
      return await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content,
      });
    },

    list: async (threadId) => {
      const openai = checkInitialization();
      const response = await openai.beta.threads.messages.list(threadId);
      return { data: response.data };
    },

    get: async (threadId, messageId) => {
      const openai = checkInitialization();
      return await openai.beta.threads.messages.retrieve(threadId, messageId);
    },

    update: async (threadId, messageId, params) => {
      const openai = checkInitialization();
      return await openai.beta.threads.messages.update(
        threadId,
        messageId,
        params
      );
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
      formData.append("file", file);
      formData.append("model", model);
      return await openai.audio.transcriptions.create(formData);
    },

    translate: async (file, model) => {
      const openai = checkInitialization();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", model);
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
    generate: async (params) => {
      const openai = checkInitialization();
      const response = await openai.images.generate(params);
      return {
        data: response.data,
      };
    },

    edit: async (params) => {
      const openai = checkInitialization();
      const response = await openai.images.edit(params);
      return {
        data: response.data,
      };
    },

    createVariation: async (params) => {
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
    list: async () => {
      const openai = checkInitialization();
      const response = await openai.files.list();
      return { data: response.data };
    },

    get: async (fileId) => {
      const openai = checkInitialization();
      return await openai.files.retrieve(fileId);
    },

    delete: async (fileId) => {
      const openai = checkInitialization();
      return await openai.files.del(fileId);
    },

    getContent: async (fileId) => {
      const openai = checkInitialization();
      return await openai.files.retrieveContent(fileId);
    },

    upload: async (file, purpose = "assistants") => {
      console.log("Uploading file to OpenAI");
      const openai = checkInitialization();
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("purpose", purpose);

        const response = await openai.files.create({
          file: file,
          purpose: purpose,
        });

        return response;
      } catch (error) {
        console.error("OpenAI File Upload Error:", error);
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
    create: async (params) => {
      const openai = checkInitialization();
      return await openai.batches.create(params);
    },
    get: async (batchId) => {
      const openai = checkInitialization();
      return await openai.batches.retrieve(batchId);
    },
    list: async () => {
      const openai = checkInitialization();
      const response = await openai.batches.list();
      return { data: response.data };
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
    create: async (params) => {
      const openai = checkInitialization();
      return await openai.beta.vectorStores.create(params);
    },
    get: async (vectorStoreId) => {
      const openai = checkInitialization();
      return await openai.beta.vectorStores.retrieve(vectorStoreId);
    },
    delete: async (vectorStoreId) => {
      const openai = checkInitialization();
      return await openai.beta.vectorStores.del(vectorStoreId);
    },
    list: async () => {
      const openai = checkInitialization();
      const response = await openai.beta.vectorStores.list();
      return { data: response.data };
    },
    update: async (vectorStoreId, params) => {
      const openai = checkInitialization();
      return await openai.beta.vectorStores.update(vectorStoreId, params);
    },
  },

  // Vector Store Files
  vectorStoreFiles: {
    create: async (vectorStoreId, params) => {
      const openai = checkInitialization();
      return await openai.beta.vectorStores.files.create(vectorStoreId, params);
    },
    get: async (vectorStoreId, fileId) => {
      const openai = checkInitialization();
      return await openai.beta.vectorStores.files.retrieve(
        vectorStoreId,
        fileId
      );
    },
    delete: async (vectorStoreId, fileId) => {
      const openai = checkInitialization();
      return await openai.beta.vectorStores.files.del(vectorStoreId, fileId);
    },
    list: async (vectorStoreId) => {
      const openai = checkInitialization();
      const response = await openai.beta.vectorStores.files.list(vectorStoreId);
      return { data: response.data };
    },
  },

  /**
   * Embeddings API
   * - create({ model: string, input: string | string[] }) -> Promise<Embedding>
   */
  embeddings: {
    create: async (params) => {
      const openai = checkInitialization();
      return await openai.embeddings.create(params);
    },
  },

  // Models
  models: {
    list: async () => {
      const openai = checkInitialization();
      return await openai.models.list();
    },
    get: async (modelId) => {
      const openai = checkInitialization();
      return await openai.models.retrieve(modelId);
    },
  },

  // Moderation
  moderation: {
    create: async (params) => {
      const openai = checkInitialization();
      return await openai.moderations.create(params);
    },
  },

  // Fine-tuning
  fineTuning: {
    create: async (params) => {
      const openai = checkInitialization();
      return await openai.fineTuning.jobs.create(params);
    },

    list: async () => {
      const openai = checkInitialization();
      const response = await openai.fineTuning.jobs.list();
      return {
        data: response.data,
      };
    },

    get: async (jobId) => {
      const openai = checkInitialization();
      return await openai.fineTuning.jobs.retrieve(jobId);
    },

    cancel: async (jobId) => {
      const openai = checkInitialization();
      return await openai.fineTuning.jobs.cancel(jobId);
    },
  },

  /**
   * Completions API
   * - create({ model: string, prompt: string, ... }) -> Promise<Completion>
   * - createStream({ model: string, prompt: string, ... }, onChunk: function) -> Promise<void>
   */
  completions: {
    create: async (params) => {
      const openai = checkInitialization();
      return await openai.completions.create(params);
    },
    createStream: async (params, onChunk) => {
      const stream = await openai.chat.completions.create({
        ...params,
        stream: true,
      });
      for await (const chunk of stream) {
        onChunk(chunk);
      }
    },
  },
};

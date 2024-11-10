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
  // Initialization
  initialize: (apiKey) => {
    if (!apiKey) return;
    openaiInstance = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  },

  setApiKey: (apiKey) => {
    if (!apiKey) return;
    openaiInstance = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  },

  // Chat Completions
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

  // Assistants
  assistants: {
    create: async (params) => {
      const openai = checkInitialization();
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

  // Threads
  threads: {
    create: async () => {
      const openai = checkInitialization();
      const thread = await openai.beta.threads.create();
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
    },

    runs: {
      create: async (threadId, assistantId) => {
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
    },
  },

  // Audio
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

  // Images
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

  // Files
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

  // Batches
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

  // Vector Stores
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

  // Embeddings
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

  // Completions
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

// openaiAssistantService.js

const OPENAI_API_BASE_URL = "https://api.openai.com/v1";

let API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

/**
 * Set the API key for OpenAI requests.
 * @param {string} key - Your OpenAI API key.
 */
export function setApiKey(key) {
  API_KEY = key;
}

/**
 * General function to make API requests to OpenAI endpoints.
 * @param {string} endpoint - The API endpoint.
 * @param {string} method - HTTP method (GET, POST, etc.).
 * @param {Object|null} data - Data to send in the request body.
 * @returns {Promise<Object>} - The response data.
 */
async function apiRequest(endpoint, method = "POST", data = null) {
  const url = `${OPENAI_API_BASE_URL}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${API_KEY}`,
  };

  const options = {
    method,
    headers,
  };

  if (data) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error.message ||
          "An error occurred while processing the request."
      );
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Create a chat completion using the Chat API.
 * @param {Object} data - The request body parameters.
 * @returns {Promise<Object>}
 */
export async function createChatCompletion(data) {
  return apiRequest("/chat/completions", "POST", data);
}

/**
 * Create a chat completion with streaming enabled.
 * @param {Object} data - The request body parameters.
 * @param {function} onData - Callback function to handle streaming data.
 * @returns {Promise<void>}
 */
export async function createChatCompletionStream(data, onData) {
  const url = `${OPENAI_API_BASE_URL}/chat/completions`;
  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };

  data.stream = true; // Enable streaming

  const options = {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error.message ||
          "An error occurred while processing the request."
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (line === "data: [DONE]") {
          // Stream finished
          return;
        }
        if (line.startsWith("data: ")) {
          const json = JSON.parse(line.substring(6));
          onData(json);
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * List available models using the Models API.
 * @returns {Promise<Object>}
 */
export async function listModels() {
  return apiRequest("/models", "GET");
}

/**
 * Retrieve a specific model using the Models API.
 * @param {string} modelId - The ID of the model to retrieve.
 * @returns {Promise<Object>}
 */
export async function retrieveModel(modelId) {
  return apiRequest(`/models/${modelId}`, "GET");
}

/**
 * Delete a fine-tuned model using the Models API.
 * (Note: Only applicable to models created via fine-tuning)
 * @param {string} modelId - The ID of the model to delete.
 * @returns {Promise<Object>}
 */
export async function deleteModel(modelId) {
  return apiRequest(`/models/${modelId}`, "DELETE");
}

/**
 * Generate embeddings using the Embeddings API.
 * @param {Object} data - The request body parameters.
 * @returns {Promise<Object>}
 */
export async function createEmbedding(data) {
  return apiRequest("/embeddings", "POST", data);
}

/**
 * Create an edit using the Edits API.
 * @param {Object} data - The request body parameters.
 * @returns {Promise<Object>}
 */
export async function createEdit(data) {
  return apiRequest("/edits", "POST", data);
}

/**
 * Create a completion using the Completions API.
 * (Although not strictly assistant-specific, it complements the assistant's capabilities)
 * @param {Object} data - The request body parameters.
 * @returns {Promise<Object>}
 */
export async function createCompletion(data) {
  return apiRequest("/completions", "POST", data);
}

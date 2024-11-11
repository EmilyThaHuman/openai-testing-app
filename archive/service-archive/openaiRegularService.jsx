// openaiRegularService.js

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
    if (data instanceof FormData) {
      // For FormData, do not set Content-Type; browser will set it with the correct boundary.
    } else {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(data);
    }
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
 * Create a completion using the Completions API.
 * @param {Object} data - The request body parameters.
 * @returns {Promise<Object>}
 */
export async function createCompletion(data) {
  return apiRequest("/completions", "POST", data);
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
 * Create an embedding using the Embeddings API.
 * @param {Object} data - The request body parameters.
 * @returns {Promise<Object>}
 */
export async function createEmbedding(data) {
  return apiRequest("/embeddings", "POST", data);
}

/**
 * Transcribe audio using the Audio Transcription API.
 * @param {File} file - The audio file to transcribe.
 * @param {string} model - The model to use.
 * @param {Object} [options] - Optional parameters.
 * @returns {Promise<Object>}
 */
export async function createAudioTranscription(file, model, options = {}) {
  const endpoint = "/audio/transcriptions";
  const url = `${OPENAI_API_BASE_URL}${endpoint}`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", model);

  for (const key in options) {
    if (options[key] !== undefined && options[key] !== null) {
      formData.append(key, options[key]);
    }
  }

  const headers = {
    Authorization: `Bearer ${API_KEY}`,
  };

  const fetchOptions = {
    method: "POST",
    headers,
    body: formData,
  };

  try {
    const response = await fetch(url, fetchOptions);
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
 * Translate audio using the Audio Translation API.
 * @param {File} file - The audio file to translate.
 * @param {string} model - The model to use.
 * @param {Object} [options] - Optional parameters.
 * @returns {Promise<Object>}
 */
export async function createAudioTranslation(file, model, options = {}) {
  const endpoint = "/audio/translations";
  const url = `${OPENAI_API_BASE_URL}${endpoint}`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", model);

  for (const key in options) {
    if (options[key] !== undefined && options[key] !== null) {
      formData.append(key, options[key]);
    }
  }

  const headers = {
    Authorization: `Bearer ${API_KEY}`,
  };

  const fetchOptions = {
    method: "POST",
    headers,
    body: formData,
  };

  try {
    const response = await fetch(url, fetchOptions);
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
 * Generate images using the Images API.
 * @param {Object} data - The request body parameters.
 * @returns {Promise<Object>}
 */
export async function createImage(data) {
  return apiRequest("/images/generations", "POST", data);
}

/**
 * Create an image edit using the Images API.
 * @param {File} imageFile - The original image file.
 * @param {File|null} maskFile - The mask image file (optional).
 * @param {string} prompt - The prompt describing the desired edit.
 * @param {Object} [options] - Optional parameters.
 * @returns {Promise<Object>}
 */
export async function createImageEdit(
  imageFile,
  maskFile,
  prompt,
  options = {}
) {
  const endpoint = "/images/edits";
  const url = `${OPENAI_API_BASE_URL}${endpoint}`;
  const formData = new FormData();
  formData.append("image", imageFile);
  if (maskFile) formData.append("mask", maskFile);
  formData.append("prompt", prompt);

  for (const key in options) {
    if (options[key] !== undefined && options[key] !== null) {
      formData.append(key, options[key]);
    }
  }

  const headers = {
    Authorization: `Bearer ${API_KEY}`,
  };

  const fetchOptions = {
    method: "POST",
    headers,
    body: formData,
  };

  try {
    const response = await fetch(url, fetchOptions);
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
 * Create image variations using the Images API.
 * @param {File} imageFile - The original image file.
 * @param {Object} [options] - Optional parameters.
 * @returns {Promise<Object>}
 */
export async function createImageVariation(imageFile, options = {}) {
  const endpoint = "/images/variations";
  const url = `${OPENAI_API_BASE_URL}${endpoint}`;
  const formData = new FormData();
  formData.append("image", imageFile);

  for (const key in options) {
    if (options[key] !== undefined && options[key] !== null) {
      formData.append(key, options[key]);
    }
  }

  const headers = {
    Authorization: `Bearer ${API_KEY}`,
  };

  const fetchOptions = {
    method: "POST",
    headers,
    body: formData,
  };

  try {
    const response = await fetch(url, fetchOptions);
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
 * Create a moderation using the Moderations API.
 * @param {Object} data - The request body parameters.
 * @returns {Promise<Object>}
 */
export async function createModeration(data) {
  return apiRequest("/moderations", "POST", data);
}

/**
 * Upload a file using the Files API.
 * @param {File} file - The file to upload.
 * @param {string} purpose - The purpose of the file (e.g., "fine-tune").
 * @returns {Promise<Object>}
 */
export async function uploadFile(file, purpose) {
  const endpoint = "/files";
  const url = `${OPENAI_API_BASE_URL}${endpoint}`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", purpose);

  const headers = {
    Authorization: `Bearer ${API_KEY}`,
  };

  const fetchOptions = {
    method: "POST",
    headers,
    body: formData,
  };

  try {
    const response = await fetch(url, fetchOptions);
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
 * List all files using the Files API.
 * @returns {Promise<Object>}
 */
export async function listFiles() {
  return apiRequest("/files", "GET");
}

/**
 * Delete a file using the Files API.
 * @param {string} fileId - The ID of the file to delete.
 * @returns {Promise<Object>}
 */
export async function deleteFile(fileId) {
  return apiRequest(`/files/${fileId}`, "DELETE");
}

/**
 * Retrieve a file using the Files API.
 * @param {string} fileId - The ID of the file to retrieve.
 * @returns {Promise<Object>}
 */
export async function retrieveFile(fileId) {
  return apiRequest(`/files/${fileId}`, "GET");
}

/**
 * Create a fine-tune job using the Fine-tunes API.
 * @param {Object} data - The request body parameters.
 * @returns {Promise<Object>}
 */
export async function createFineTune(data) {
  return apiRequest("/fine-tunes", "POST", data);
}

/**
 * List all fine-tune jobs using the Fine-tunes API.
 * @returns {Promise<Object>}
 */
export async function listFineTunes() {
  return apiRequest("/fine-tunes", "GET");
}

/**
 * Retrieve a fine-tune job using the Fine-tunes API.
 * @param {string} fineTuneId - The ID of the fine-tune job.
 * @returns {Promise<Object>}
 */
export async function retrieveFineTune(fineTuneId) {
  return apiRequest(`/fine-tunes/${fineTuneId}`, "GET");
}

/**
 * Cancel a fine-tune job using the Fine-tunes API.
 * @param {string} fineTuneId - The ID of the fine-tune job.
 * @returns {Promise<Object>}
 */
export async function cancelFineTune(fineTuneId) {
  return apiRequest(`/fine-tunes/${fineTuneId}/cancel`, "POST");
}

/**
 * Delete a fine-tuned model using the Fine-tunes API.
 * @param {string} model - The name of the model to delete.
 * @returns {Promise<Object>}
 */
export async function deleteFineTuneModel(model) {
  return apiRequest(`/models/${model}`, "DELETE");
}

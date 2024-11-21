/**
 * Process a streaming response from OpenAI
 * @param {ReadableStream} stream - The stream from OpenAI
 * @param {Function} onChunk - Callback for each chunk of text
 * @returns {Promise<string>} The complete response text
 */
export const processStreamingResponse = async (stream, onChunk) => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let responseText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      // Decode the chunk and process it
      const chunk = decoder.decode(value, { stream: true });
      responseText += chunk;
      
      // Call the callback with the new chunk
      if (onChunk) {
        onChunk(chunk);
      }
    }
  } finally {
    reader.releaseLock();
  }

  return responseText;
};

/**
 * Parse an SSE message from OpenAI
 * @param {string} chunk - Raw chunk from the stream
 * @returns {Object|null} Parsed message or null if not complete
 */
export const parseSSEMessage = (chunk) => {
  if (!chunk.includes('data: ')) {
    return null;
  }

  try {
    const data = chunk
      .split('\n')
      .find(line => line.startsWith('data: '))
      ?.replace('data: ', '');

    if (!data || data === '[DONE]') {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing SSE message:', error);
    return null;
  }
};

/**
 * Create a text stream processor
 * @param {Function} onToken - Callback for each token
 * @returns {TransformStream} Stream transformer
 */
export const createTokenProcessor = (onToken) => {
  let buffer = '';
  
  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk;
      const messages = buffer.split('\n\n');
      
      // Process all complete messages
      messages.slice(0, -1).forEach(message => {
        const parsed = parseSSEMessage(message);
        if (parsed?.choices?.[0]?.delta?.content) {
          onToken(parsed.choices[0].delta.content);
        }
      });
      
      // Keep the incomplete message in the buffer
      buffer = messages[messages.length - 1];
    },
    
    flush(controller) {
      if (buffer) {
        const parsed = parseSSEMessage(buffer);
        if (parsed?.choices?.[0]?.delta?.content) {
          onToken(parsed.choices[0].delta.content);
        }
      }
    }
  });
}; 
import React, { useState, useEffect } from 'react';
import { OpenAI } from 'openai';

const AssistantFileProcessing = () => {
  const [vectorStoreId, setVectorStoreId] = useState(
    import.meta.env.VITE_OPENAI_VECTOR_STORE_ID
  );
  const [assistantId, setAssistantId] = useState(
    import.meta.env.VITE_OPENAI_ASSISTANT_ID
  );
  const [fileBatchStatus, setFileBatchStatus] = useState(null);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const openAI = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const handleFileChange = e => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Please select files to upload.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create Vector Store
      const vectorStore = await openAI.vectorStores.create({
        name: 'Real Estate',
      });
      setVectorStoreId(vectorStore.id);

      // Step 2: Upload files using OpenAI SDK
      const fileIds = await Promise.all(
        selectedFiles.map(async file => {
          const response = await openAI.files.create({
            file: file,
            purpose: 'assistants',
          });
          return response.id;
        })
      );

      // Step 3: Create file batch in vector store
      const vectorStoreFileBatch = await openAI.vectorStores.fileBatches.create(
        {
          vector_store_id: vectorStore.id,
          file_ids: fileIds,
        }
      );
      setFileBatchStatus(vectorStoreFileBatch.status);

      // Step 4: Create assistant
      const assistant = await openAI.assistants.create({
        description:
          'This assistant is an expert at real estate in Canada and the US',
        model: 'gpt-4-turbo-preview',
        name: 'Real Estate Friend',
      });
      setAssistantId(assistant.id);

      // Step 5: Update assistant with vector store
      await openAI.assistants.update(assistant.id, {
        tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
      });

      // Start streaming the assistant's response
      await streamAssistantResponse(assistant.id);
    } catch (error) {
      setError(error.message);
      console.error('Error in setup and file processing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const streamAssistantResponse = async assistantId => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/assistant/${assistantId}/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt:
              'Provide insights on the real estate markets in Canada and the US.',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Stream request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setStreamingResponse(prev => prev + chunk);
      }
    } catch (error) {
      setError('Error streaming assistant response: ' + error.message);
      console.error('Error streaming assistant response:', error);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        OpenAI File Processing and Streaming Response
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="border p-2 rounded"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className={`px-4 py-2 rounded ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Upload and Process'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="mt-4 space-y-2">
        <p>Vector Store ID: {vectorStoreId}</p>
        <p>Assistant ID: {assistantId}</p>
        <p>File Batch Status: {fileBatchStatus}</p>
      </div>

      {streamingResponse && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Assistant Response:</h2>
          <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
            {streamingResponse}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AssistantFileProcessing;

// useOpenAI.js

import { useContext } from "react";
import { OpenAIContext } from "../context/OpenAIContext";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";

/**
 * Hook to interact with Chat Completion API
 */
export const useChatCompletion = () => {
  const { messages, addMessage } = useContext(OpenAIContext);

  const sendMessage = async (content, options = {}) => {
    // Add user's message to context
    const userMessage = { role: "user", content };
    addMessage(userMessage);

    // Prepare data for API call
    const data = {
      model: options.model || "gpt-4", // Specify model or default to 'gpt-4'
      messages: [...messages, userMessage],
      ...options, // Include any other options
    };

    try {
      const response = await UnifiedOpenAIService.chat.create(data);
      const assistantMessage = response.choices[0].message;
      // Add assistant's message to context
      addMessage(assistantMessage);
      return assistantMessage;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw error;
    }
  };

  return { messages, sendMessage };
};

/**
 * Hook to interact with Image Generation API
 */
export const useImageGeneration = () => {
  const { data, setData } = useContext(OpenAIContext);

  const generateImage = async (prompt, options = {}) => {
    const data = {
      prompt,
      ...options,
    };

    try {
      const response = await UnifiedOpenAIService.images.generate(data);
      // Store generated images in context
      setData(response.data);
      return response.data;
    } catch (error) {
      console.error("Error in generateImage:", error);
      throw error;
    }
  };

  return { data, generateImage };
};

/**
 * Hook to interact with Audio Transcription API
 */
export const useAudioTranscription = () => {
  const { data, setData } = useContext(OpenAIContext);

  const transcribeAudio = async (file, model, options = {}) => {
    try {
      const response = await UnifiedOpenAIService.audio.transcribe(
        file,
        model,
        options
      );
      setData(response);
      return response;
    } catch (error) {
      console.error("Error in transcribeAudio:", error);
      throw error;
    }
  };

  return { data, transcribeAudio };
};

// Add more hooks as needed for other service functions

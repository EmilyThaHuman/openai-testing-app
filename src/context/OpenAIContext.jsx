// OpenAIContext.js

import React, { createContext, useContext, useState, useEffect } from "react";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";

export const OpenAIContext = createContext();

export const OpenAIProvider = ({ children }) => {
  // State variables
  const [messages, setMessages] = useState([]);
  const [data, setData] = useState(null);
  const [result, setResult] = useState("");
  const [apiKey, setApiKey] = useState(() => {
    // Try to get API key from localStorage
    return localStorage.getItem("openai_api_key") || "";
  });

  // Initialize OpenAI service when the context mounts
  useEffect(() => {
    if (apiKey) {
      UnifiedOpenAIService.initialize(apiKey);
    }
  }, [apiKey]);

  const updateApiKey = (newApiKey) => {
    setApiKey(newApiKey);
    localStorage.setItem("openai_api_key", newApiKey);
    UnifiedOpenAIService.initialize(newApiKey);
  };

  // Chat Completion
  const sendMessage = async (content, options = {}) => {
    const userMessage = { role: "user", content };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const data = {
      model: options.model || "gpt-4",
      messages: [...messages, userMessage],
      ...options,
    };

    try {
      const response = await UnifiedOpenAIService.chat.create(data);
      const assistantMessage = response.choices[0].message;
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      return assistantMessage;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw error;
    }
  };

  // Image Generation
  const generateImage = async (prompt, options = {}) => {
    try {
      const response = await UnifiedOpenAIService.createImage({
        prompt,
        ...options,
      });
      setData(response.data);
      return response.data;
    } catch (error) {
      console.error("Error in generateImage:", error);
      throw error;
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value = {
    messages,
    sendMessage,
    data,
    generateImage,
    result,
    apiKey,
    setApiKey: updateApiKey,
    clearMessages,
  };

  return (
    <OpenAIContext.Provider value={value}>{children}</OpenAIContext.Provider>
  );
};

export const useOpenAI = () => {
  const context = useContext(OpenAIContext);
  if (context === undefined) {
    throw new Error("useOpenAI must be used within an OpenAIProvider");
  }
  return context;
};

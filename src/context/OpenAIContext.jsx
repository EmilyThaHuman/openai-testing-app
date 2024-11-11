// OpenAIContext.js

import React, { createContext, useContext, useState, useEffect } from "react";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { toast } from "@/components/ui/use-toast";

export const useOpenAIStore = create(
  persist(
    (set, get) => ({
      messages: [],
      data: null,
      result: "",
      apiKey: "",
      isInitialized: false,
      error: null,
      isLoading: false,

      // Initialize the service
      initialize: () => {
        const apiKey = get().apiKey;
        if (apiKey && !get().isInitialized) {
          UnifiedOpenAIService.initialize(apiKey);
          set({ isInitialized: true });
        }
      },

      // Update API key
      setApiKey: (newApiKey) => {
        try {
          UnifiedOpenAIService.initialize(newApiKey);
          set({ 
            apiKey: newApiKey, 
            isInitialized: true,
            error: null 
          });
          toast({
            title: "API Key Updated",
            description: "Your OpenAI API key has been successfully updated.",
          });
        } catch (error) {
          set({ error: error.message });
          toast({
            variant: "destructive",
            title: "API Key Error",
            description: error.message,
          });
        }
      },

      // Clear messages
      clearMessages: () => set({ messages: [] }),

      // Send a message
      sendMessage: async (content, options = {}) => {
        set({ isLoading: true, error: null });

        try {
          const userMessage = { role: "user", content };
          set((state) => ({
            messages: [...state.messages, userMessage]
          }));

          const response = await UnifiedOpenAIService.chat.create({
            model: options.model || "gpt-4",
            messages: [...get().messages, userMessage],
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 1000,
            top_p: options.topP || 1,
            frequency_penalty: options.frequencyPenalty || 0,
            presence_penalty: options.presencePenalty || 0,
            stream: options.stream || false,
          });

          if (options.stream) {
            let streamContent = '';
            const assistantMessage = {
              role: "assistant",
              content: '',
            };

            set((state) => ({
              messages: [...state.messages, assistantMessage]
            }));

            for await (const chunk of response) {
              const content = chunk.choices[0]?.delta?.content || '';
              streamContent += content;
              
              set((state) => ({
                messages: state.messages.map((msg, index) => 
                  index === state.messages.length - 1
                    ? { ...msg, content: streamContent }
                    : msg
                )
              }));
            }

            return { ...assistantMessage, content: streamContent };
          } else {
            const assistantMessage = response.choices[0].message;
            set((state) => ({
              messages: [...state.messages, assistantMessage]
            }));
            return assistantMessage;
          }
        } catch (error) {
          set({ error: error.message });
          toast({
            variant: "destructive",
            title: "Message Error",
            description: error.message,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Generate an image
      generateImage: async (prompt, options = {}) => {
        set({ isLoading: true, error: null });

        try {
          const response = await UnifiedOpenAIService.createImage({
            prompt,
            n: options.n || 1,
            size: options.size || "1024x1024",
            response_format: options.responseFormat || "url",
          });

          set({ 
            data: response.data,
            error: null 
          });
          
          return response.data;
        } catch (error) {
          set({ error: error.message });
          toast({
            variant: "destructive",
            title: "Image Generation Error",
            description: error.message,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "openai-storage",
      partialize: (state) => ({
        apiKey: state.apiKey,
        isInitialized: state.isInitialized,
      }),
    }
  )
);

// Helper hook for shallow equality checks
export const useOpenAIStoreShallow = (selector) => 
  useOpenAIStore(selector, shallow);

// Optional: Keep context for backward compatibility
export const OpenAIContext = React.createContext(null);

export const OpenAIProvider = ({ children }) => {
  const store = useOpenAIStore();

  // Initialize on mount
  React.useEffect(() => {
    store.initialize();
  }, []);

  return (
    <OpenAIContext.Provider value={useOpenAIStore}>
      {children}
    </OpenAIContext.Provider>
  );
};

// Helper hook for context-based access
export const useOpenAI = () => {
  const context = React.useContext(OpenAIContext);
  if (context === undefined) {
    throw new Error("useOpenAI must be used within an OpenAIProvider");
  }
  return context;
};

// Example usage in components:
/*
// Using direct store access
const { apiKey, sendMessage } = useOpenAIStore(state => ({
  apiKey: state.apiKey,
  sendMessage: state.sendMessage,
}));

// Using shallow comparison
const { apiKey, sendMessage } = useOpenAIStoreShallow(state => ({
  apiKey: state.apiKey,
  sendMessage: state.sendMessage,
}));

// Using context (backward compatibility)
const openAI = useOpenAI();
*/

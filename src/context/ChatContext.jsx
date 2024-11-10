import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useOpenAI } from "./OpenAIContext";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import { useToast } from "../components/ui/use-toast";

const ChatContext = createContext({});

const defaultSettings = {
  model: "gpt-4-turbo-preview",
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  systemPrompt: "",
  streaming: false
};

const MODELS = {
  "gpt-4-turbo-preview": "GPT-4 Turbo",
  "gpt-4": "GPT-4",
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
};

const MODEL_DESCRIPTIONS = {
  "gpt-4-turbo-preview": "Most capable model, best for complex tasks",
  "gpt-4": "High capability, more focused on accuracy",
  "gpt-3.5-turbo": "Fast and cost-effective for simpler tasks",
};

const SETTING_DESCRIPTIONS = {
  temperature:
    "Controls randomness in responses. Higher values make output more creative but less focused.",
  maxTokens:
    "Maximum length of the response. Higher values allow longer responses but cost more.",
  topP: "Controls diversity of responses. Lower values make output more focused and deterministic.",
  frequencyPenalty: "Reduces repetition by penalizing frequently used words.",
  presencePenalty: "Encourages the model to talk about new topics.",
  systemPrompt: "Sets the behavior and role of the AI assistant.",
};

export function ChatProvider({ children }) {
  const { apiKey } = useOpenAI();
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("chats");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeChatId, setActiveChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [model, setModel] = useState("gpt-4-turbo-preview");
  const { toast } = useToast();

  const activeChat = useMemo(() => 
    chats.find(chat => chat.id === activeChatId),
    [chats, activeChatId]
  );

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  // Create a new chat with default settings
  const createNewChat = useCallback(() => {
    const newChat = {
      id: Date.now().toString(),
      title: `Chat ${chats.length + 1}`,
      messages: [],
      settings: {
        model: "gpt-4-turbo-preview",
        temperature: 0.7,
        maxTokens: 1000,
        streaming: false,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        systemPrompt: "",
      },
      createdAt: new Date().toISOString(),
    };

    setChats(prev => [...prev, newChat]);
    setActiveChatId(newChat.id);
    return newChat;
  }, [chats.length]);

  // Create a new chat
  const createChat = (title = "New Chat") => {
    try {
      const newChat = {
        id: Date.now().toString(),
        title,
        messages: [],
        settings: { ...defaultSettings },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setChats((prev) => [...prev, newChat]);
      setActiveChatId(newChat.id);
      toast({
        title: "Chat created",
        description: `New chat "${title}" has been created.`,
      });
      return newChat.id;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating chat",
        description: error.message,
      });
    }
  };

  // Delete a chat
  const deleteChat = (chatId) => {
    try {
      const chatToDelete = chats.find((chat) => chat.id === chatId);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
      }
      toast({
        title: "Chat deleted",
        description: `Chat "${chatToDelete?.title}" has been deleted.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting chat",
        description: error.message,
      });
    }
  };

  // Update chat title
  const updateChatTitle = (chatId, newTitle) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title: newTitle,
              updatedAt: new Date().toISOString(),
            }
          : chat
      )
    );
  };

  // Clear chat messages
  const clearChat = (chatId) => {
    try {
      const chatToClear = chats.find((chat) => chat.id === chatId);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [],
                updatedAt: new Date().toISOString(),
              }
            : chat
        )
      );
      toast({
        title: "Chat cleared",
        description: `Messages in "${chatToClear?.title}" have been cleared.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error clearing chat",
        description: error.message,
      });
    }
  };

  const addMessage = useCallback((chatId, message) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
    );
  }, []);

  // Send message in active chat
  const sendMessage = async (content, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create new chat if none exists
      let chat = chats.find(c => c.id === activeChatId);
      if (!chat) {
        chat = createNewChat();
      }

      // Create the user message
      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        timestamp: new Date().toISOString(),
        files: options.files || [],
      };

      // Add user message to chat immediately
      const updatedMessages = [...chat.messages, userMessage];
      setChats(prevChats => 
        prevChats.map(c => 
          c.id === chat.id 
            ? { ...c, messages: updatedMessages }
            : c
        )
      );

      // Prepare messages array for API
      const apiMessages = [
        // Add system message if it exists
        ...(chat.settings.systemPrompt 
          ? [{ role: "system", content: chat.settings.systemPrompt.trim() }] 
          : []
        ),
        // Add previous messages
        ...updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content.trim()
        }))
      ];

      // Validate messages array
      if (!apiMessages.length) {
        throw new Error("No messages to send");
      }

      // Make API request
      const response = await UnifiedOpenAIService.chat.create({
        model: options.settings?.model || chat.settings.model || "gpt-4-turbo-preview",
        messages: apiMessages,
        temperature: Number(options.settings?.temperature ?? chat.settings.temperature ?? 0.7),
        max_tokens: Number(options.settings?.maxTokens ?? chat.settings.maxTokens ?? 1000),
        top_p: Number(options.settings?.topP ?? chat.settings.topP ?? 1),
        frequency_penalty: Number(options.settings?.frequencyPenalty ?? chat.settings.frequencyPenalty ?? 0),
        presence_penalty: Number(options.settings?.presencePenalty ?? chat.settings.presencePenalty ?? 0),
        stream: Boolean(options.settings?.stream ?? chat.settings.streaming ?? false),
      });

      // Create and add assistant message
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.choices[0].message.content,
        timestamp: new Date().toISOString(),
      };

      // Update chat with assistant response
      setChats(prevChats => 
        prevChats.map(c => 
          c.id === chat.id 
            ? { ...c, messages: [...updatedMessages, assistantMessage] }
            : c
        )
      );

      return assistantMessage;

    } catch (err) {
      console.error("Chat error:", err);
      setError(err.message || "Failed to send message");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatSettings = (chatId, newSettings) => {
    try {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                settings: newSettings,
                updatedAt: new Date().toISOString(),
              }
            : chat
        )
      );
      toast({
        title: "Settings updated",
        description: "Chat settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating settings",
        description: error.message,
      });
    }
  };

  const getSettingInfo = useCallback(
    (key) => {
      return {
        label:
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
        description: SETTING_DESCRIPTIONS[key],
        value: activeChat?.settings?.[key] ?? defaultSettings[key],
        min: key.includes("Penalty")
          ? -2
          : key === "temperature" || key === "topP"
            ? 0
            : 100,
        max: key.includes("Penalty")
          ? 2
          : key === "temperature"
            ? 2
            : key === "topP"
              ? 1
              : 4000,
        step: key === "maxTokens" ? 100 : 0.1,
      };
    },
    [activeChat]
  );

  const value = {
    chats,
    activeChat,
    activeChatId,
    isLoading,
    error,
    model,
    setModel,
    setActiveChatId,
    createChat,
    deleteChat,
    updateChatTitle,
    clearChat,
    sendMessage,
    updateChatSettings,
    models: MODELS,
    modelDescriptions: MODEL_DESCRIPTIONS,
    getSettingInfo,
    createNewChat,
    addMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

import React, { useState, useEffect, useCallback } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/components/ui/use-toast";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Trash2, Settings2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useInView } from "react-intersection-observer";
import SystemInstructions from "@/components/chat/SystemInstructions";
import { useStoreShallow } from "@/store/useStore";
import EmptyChat from "@/components/chat/EmptyChat";
import EmptySidebar from "@/components/chat/EmptySidebar";

// Define your settings groups
const SETTINGS_GROUPS = {
  model: {
    title: "Model Settings",
    icon: Settings2,
    settings: [
      { key: "model", type: "select" },
      { key: "temperature", type: "slider" },
      { key: "maxTokens", type: "slider" },
    ],
  },
  advanced: {
    title: "Advanced Settings",
    icon: Settings2,
    settings: [
      { key: "streaming", type: "toggle" },
      { key: "topP", type: "slider" },
      { key: "frequencyPenalty", type: "slider" },
      { key: "presencePenalty", type: "slider" },
    ],
  },
  system: {
    title: "System Prompt",
    icon: Settings2,
    settings: [{ key: "systemPrompt", type: "textarea" }],
  },
};

// Component to handle individual settings controls
const SettingControl = ({ settingKey, type, onSettingChange }) => {
  const store = useStoreShallow();

  const setting = store.getSettingInfo(settingKey);

  if (!setting) return null;

  const controls = {
    toggle: (
      <Switch
        checked={setting.value ?? false}
        onCheckedChange={(checked) => onSettingChange(settingKey, checked)}
      />
    ),
    select: (
      <Select
        value={String(setting.value)}
        onValueChange={(value) => onSettingChange(settingKey, value)}
      >
        <SelectTrigger>
          <SelectValue placeholder={`Select ${setting.label}`} />
        </SelectTrigger>
        <SelectContent>
          {store.models &&
            Object.entries(models).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    ),
    slider: (
      <div className="space-y-2">
        <Slider
          value={[Number(setting.value) || 0]}
          min={setting.min || 0}
          max={setting.max || 1}
          step={setting.step || 0.1}
          onValueChange={([value]) => onSettingChange(settingKey, value)}
        />
        <div className="text-xs text-muted-foreground">
          Value: {setting.value}
        </div>
      </div>
    ),
    textarea: (
      <textarea
        className="w-full h-32 p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        value={setting.value || ""}
        onChange={(e) => onSettingChange(settingKey, e.target.value)}
        placeholder={`Enter ${setting.label.toLowerCase()}...`}
      />
    ),
  };

  return (
    <div className="space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <Label>{setting.label}</Label>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{setting.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {controls[type]}
    </div>
  );
};

export default function ChatTesting() {
  const { toast } = useToast();
  const { ref: scrollRef, inView } = useInView();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const store = useStoreShallow((state) => ({
    // State
    chats: state.chats,
    activeChat: state.activeChat,
    activeChatId: state.activeChatId,
    isLoading: state.isLoading,
    error: state.error,
    model: state.model,
    models: state.models,
    modelDescriptions: state.modelDescriptions,
    // Setters
    setModel: state.setModel,
    setActiveChatId: state.setActiveChatId,
    setActiveChat: state.setActiveChat,
    setChats: state.setChats,
    setLoading: state.setLoading,
    setError: state.setError,
    // Actions
    createChat: state.createChat,
    deleteChat: state.deleteChat,
    updateChatTitle: state.updateChatTitle,
    clearChat: state.clearChat,
    updateChatSettings: state.updateChatSettings,
    getSettingInfo: state.getSettingInfo,
    sendMessage: state.sendChatMessage,
    loadChatsFromCache: state.loadChatsFromCache,
    addMessage: state.addMessage,
  }));

  // Initialize chat state
  React.useEffect(() => {
    store.loadChatsFromCache();
  }, []);

  const {
    chats,
    activeChat,
    activeChatId,
    models,
    isLoading,
    error,
    setActiveChatId,
    setActiveChat,
    sendMessage,
    updateChatSettings,
    getSettingInfo,
    clearChat,
    createNewChat,
    addMessage,
    createChat,
    deleteChat,
  } = store;

  useEffect(() => {
    if (!inView && activeChat?.messages?.length) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat?.messages, inView]);

  const handleSettingChange = useCallback(
    (key, value) => {
      if (!activeChat) return;

      const newSettings = {
        ...activeChat.settings,
        [key]: value,
      };

      updateChatSettings(activeChat.id, newSettings);

      toast({
        title: "Settings Updated",
        description: `${key} has been updated to ${value}`,
        duration: 2000,
      });
    },
    [activeChat, updateChatSettings, toast]
  );

  useEffect(() => {
    if (activeChat?.settings) {
      setIsSettingsOpen((isOpen) => isOpen);
    }
  }, [activeChat?.settings]);

  useEffect(() => {
    if (error) {
      setErrorMessage(
        typeof error === "string"
          ? error
          : error.message || "An error occurred in chat testing"
      );
    } else {
      setErrorMessage("");
    }
  }, [error]);

  useEffect(() => {
    if (!activeChat && chats?.length === 0) {
      const newChat = createNewChat();
      setActiveChatId(newChat.id);
    } else if (!activeChat && chats?.length > 0) {
      setActiveChatId(chats[0].id);
    }
  }, [chats?.length, activeChat, createNewChat, setActiveChatId]);

  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) return null;

      const fileId = `${file.name}-${Date.now()}`;

      setUploadProgress((prev) => ({
        ...prev,
        [fileId]: 0,
      }));

      try {
        const response = await UnifiedOpenAIService.files.upload(
          file,
          "assistants"
        );

        setUploadedFiles((prev) => [
          ...prev,
          {
            id: response.id,
            name: file.name,
            type: file.type,
            size: file.size,
          },
        ]);

        setUploadProgress((prev) => {
          const { [fileId]: removed, ...rest } = prev;
          return rest;
        });

        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been uploaded`,
        });

        return response;
      } catch (error) {
        console.error("File upload error:", error);
        setUploadProgress((prev) => {
          const { [fileId]: removed, ...rest } = prev;
          return rest;
        });

        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload file",
          variant: "destructive",
        });

        return null;
      }
    },
    [toast]
  );

  const handleSend = useCallback(
    async (message, files = []) => {
      console.log("Sending message", message, files);
      // If there's no message and no files, or if the chat is loading, do nothing
      if ((!message?.trim() && files.length === 0) || isLoading) return;

      let currentChat = activeChat;
      if (!currentChat) {
        console.log("Creating new chat");
        currentChat = createNewChat();
        setActiveChatId(currentChat.id);
        setActiveChat(currentChat);
      }

      try {
        const uploadedFiles = files
          .filter((file) => file && file.id)
          .map((file) => file.id);

        const settings = currentChat.settings || {};
        const formattedMessage = message.trim();

        // Add user message immediately to show in UI
        const userMessage = {
          id: Date.now().toString(),
          role: "user",
          content: formattedMessage,
          files: uploadedFiles,
          timestamp: new Date().toISOString(),
        };

        // Update messages in context
        addMessage(currentChat.id, userMessage);

        // Send message and get response
        const response = await sendMessage(formattedMessage, {
          files: uploadedFiles,
          settings: {
            model: settings.model,
            temperature: Number(settings.temperature) || 0.7,
            maxTokens: Number(settings.maxTokens) || 1000,
            stream: Boolean(settings.streaming),
            topP: Number(settings.topP) || 1,
            frequencyPenalty: Number(settings.frequencyPenalty) || 0,
            presencePenalty: Number(settings.presencePenalty) || 0,
            systemPrompt: settings.systemPrompt?.trim(),
          },
        });

        console.log("Response", response);

        // Scroll to bottom after message is sent
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);

        const assistantMessage = response.content;
        if (assistantMessage) {
          addMessage(currentChat.id, assistantMessage);
        }

        return response;
      } catch (error) {
        console.error("Chat error:", error);
        toast({
          title: "Chat Error",
          description: error.message || "Failed to send message",
          variant: "destructive",
        });
      }
    },
    [
      activeChat,
      isLoading,
      sendMessage,
      addMessage,
      toast,
      scrollRef,
      createNewChat,
      setActiveChatId,
    ]
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar for Chat History */}
      {/* Sidebar for Chat History */}
      {isSidebarOpen && (
        <div className="w-56 p-4 overflow-auto border-r">
          {chats?.length === 0 ? (
            <EmptySidebar onNewChat={() => createChat()} />
          ) : (
            <>
              <Button className="w-full mb-4" onClick={() => createChat()}>
                New Chat
              </Button>
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {Array.isArray(chats) && chats.length > 0 ? (
                    chats.map((chat) => (
                      <Card
                        key={chat.id}
                        className={`p-3 cursor-pointer hover:bg-accent ${
                          chat.id === activeChatId ? "bg-accent" : ""
                        }`}
                        onClick={() => setActiveChatId(chat.id)}
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium truncate">
                            {chat.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat.id);
                            }}
                          >
                            ×
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </p>
                      </Card>
                    ))
                  ) : (
                    <EmptySidebar />
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {!activeChat ? (
          <EmptyChat onNewChat={() => createChat()} />
        ) : (
          <>
            {/* Header with Toggle Buttons */}
            <div className="flex justify-between items-center p-4 border-b">
              {/* Toggle Sidebar Button */}
              <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                {isSidebarOpen ? "Hide Chats" : "Show Chats"}
              </Button>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  title="Toggle settings"
                >
                  <Settings2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* System Instructions */}
            <SystemInstructions
              value={activeChat?.settings?.systemPrompt || ""}
              onChange={(newInstructions) =>
                handleSettingChange("systemPrompt", newInstructions)
              }
            />

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {activeChat?.messages?.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isUser={message.role === "user"}
                    files={message.files}
                  />
                ))}
                {isLoading && (
                  <div className="flex justify-center">
                    <Loading />
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 border-t">
              <ChatInput
                onSend={handleSend}
                onFileUpload={handleFileUpload}
                disabled={isLoading}
                placeholder="Send a message or upload files..."
                uploadedFiles={uploadedFiles}
              />
            </div>
          </>
        )}
      </div>

      {/* Settings Sidebar */}
      {isSettingsOpen && (
        <div className="w-80 p-4 overflow-auto border-l">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Settings</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsOpen(false)}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {Object.entries(SETTINGS_GROUPS).map(([key, group]) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="flex items-center gap-2">
                  <group.icon className="w-4 h-4" />
                  {group.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {group.settings.map((setting) => (
                      <SettingControl
                        key={setting.key}
                        settingKey={setting.key}
                        type={setting.type}
                        onSettingChange={handleSettingChange}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Card className="p-4 bg-destructive text-destructive-foreground">
            <p>{errorMessage}</p>
          </Card>
        </div>
      )}
    </div>
  );
}

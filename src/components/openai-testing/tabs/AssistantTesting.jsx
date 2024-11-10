import React, { useState, useMemo, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOpenAI } from "@/context/OpenAIContext";
import { useToast } from "@/components/ui/use-toast";
import AssistantForm from "../../assistants/AssistantForm";
import AssistantList from "../../assistants/AssistantList";
import ThreadList from "../../assistants/ThreadList";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, MessageSquare, Plus, Users } from "lucide-react";
import { DEFAULT_ASSISTANT } from "../../../constants/assistantConstants";
import { useAssistants } from "@/hooks/use-assistants";
import { useThreads } from "@/hooks/use-threads";
import ThreadMessages from "../../assistants/ThreadMessages";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import useRuns from "@/hooks/use-runs";
import { useActiveRun } from "@/hooks/use-active-run";
import { ChatDialog } from "@/components/chat/ChatDialog";

export default function AssistantTesting() {
  const { apiKey } = useOpenAI();
  const { toast } = useToast();

  // State
  const [newAssistant, setNewAssistant] = useState(DEFAULT_ASSISTANT);
  const [newMessage, setNewMessage] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingMessages, setStreamingMessages] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  const [error, setError] = useState(null); // Add error state

  // Custom hooks
  const {
    assistants,
    loading: assistantsLoading,
    error: assistantsError,
    createAssistant,
    fetchAssistants,
    selectedAssistant,
    setSelectedAssistant,
  } = useAssistants(apiKey);

  const {
    threads,
    threadMessages,
    loading: threadsLoading,
    expandedThreads,
    createThread,
    deleteThread,
    toggleThread,
    sendMessage,
    fetchThreadMessages,
    selectedThread,
    setSelectedThread,
  } = useThreads(selectedAssistant);

  const {
    submitMessage,
    startNewRun,
    cancelRun,
    currentRun,
    currentThread,
    toolCalls,
    status,
    isRunning,
    error: runError,
  } = useActiveRun({
    onToolExecution: async (toolCalls) => {
      // Handle tool execution
      return toolCalls.map((call) => ({
        tool_call_id: call.id,
        output: JSON.stringify({ result: "Tool executed successfully" }),
      }));
    },
  });

  // Combine loading states
  const loading = threadsLoading || assistantsLoading;

  const handleStartRun = useCallback(
    async (assistant) => {
      console.log("Starting run with assistant:", assistant);
      try {
        const { run, thread, messages } = await startNewRun(
          assistant.id,
          "Initial message" // Optional
        );
        console.log("Run:", run);
        console.log("Thread:", thread);
        console.log("Messages:", messages);
        setChatMessages(messages);
        setChatOpen(true);
      } catch (error) {
        // Handle error
        setError(error);
        toast({
          title: "Error",
          description: "Failed to start new run",
          variant: "destructive",
        });
      }
    },
    [startNewRun]
  );
  const handleChatMessage = useCallback(
    async (message, fileIds = []) => {
      if (!currentThread?.id || !selectedAssistant?.id) {
        throw new Error("No active conversation");
      }
      if (!message.trim()) return;

      try {
        const { run, thread, messages } = await submitMessage(message);
        setSelectedThread(thread);
        setChatMessages(messages);
        console.log("Run:", run);
      } catch (err) {
        setError(err);
        console.error("Failed to send message:", err);
      }
    },
    [submitMessage, setSelectedThread]
  );
  // Combine error states
  useEffect(() => {
    setError(assistantsError);
  }, [assistantsError]);

  const filteredThreads = useMemo(() => {
    const threadsArray = Array.isArray(threads) ? threads : [];
    return selectedAssistant
      ? threadsArray.filter(
          (thread) => thread.metadata?.assistantId === selectedAssistant.id
        )
      : [];
  }, [threads, selectedAssistant]);

  const handleCreateEmptyThread = async () => {
    try {
      const thread = await createThread();
      if (thread) {
        setSelectedThread(thread);
      }
    } catch (err) {
      setError(err);
    }
  };

  const handleCreateThread = useCallback(async () => {
    if (!selectedAssistant) return;

    try {
      const thread = await createThread();
      const threads = JSON.parse(
        localStorage.getItem("openai_threads") || "[]"
      );
      const updatedThreads = [...threads, thread];
      localStorage.setItem("openai_threads", JSON.stringify(updatedThreads));
      await startNewRun(selectedAssistant.id, {
        threadId: thread.id,
        initialMessage: "Hello!",
      });
    } catch (err) {
      setError(err);
      console.error("Failed to create thread:", err);
    }
  }, [selectedAssistant, createThread, startNewRun]);

  const handleFileUpload = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "assistants");

      const response = await UnifiedOpenAIService.files.create(formData);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);
  const handleThreadExpand = (threadId) => {
    toggleThread(new Set([threadId]));
  };
  // Handlers
  const handleAssistantSelect = async (assistant) => {
    setSelectedAssistant(assistant);
  };

  const handleCreateAssistant = async () => {
    if (!newAssistant.name || !newAssistant.model) {
      toast({
        title: "Error",
        description: "Name and model are required",
        variant: "destructive",
      });
      return;
    }

    const formattedTools = newAssistant.tools.map((tool) => ({ type: tool }));
    const assistantData = {
      name: newAssistant.name.trim(),
      instructions: newAssistant.instructions.trim(),
      model: newAssistant.model,
      tools: formattedTools,
      file_ids: newAssistant.file_ids,
      metadata: newAssistant.metadata,
      ...(newAssistant.temperature !== 0.7 && {
        temperature: newAssistant.temperature,
      }),
      ...(newAssistant.top_p !== 1 && { top_p: newAssistant.top_p }),
      ...(newAssistant.presence_penalty !== 0 && {
        presence_penalty: newAssistant.presence_penalty,
      }),
      ...(newAssistant.frequency_penalty !== 0 && {
        frequency_penalty: newAssistant.frequency_penalty,
      }),
      ...(newAssistant.response_format.type !== "text" && {
        response_format: newAssistant.response_format,
      }),
    };

    await createAssistant(assistantData);
    setNewAssistant(DEFAULT_ASSISTANT);
  };

  const handleSendMessage = async (threadId) => {
    if (!newMessage.trim() || threadsLoading) return;

    try {
      if (streaming) {
        const stream = await sendMessage(threadId, newMessage, {
          stream: true,
        });
        for await (const chunk of stream) {
          if (chunk.choices?.[0]?.delta?.content) {
            setStreamingMessages((prev) => ({
              ...prev,
              [threadId]:
                (prev[threadId] || "") + chunk.choices[0].delta.content,
            }));
          }
        }
      } else {
        await sendMessage(threadId, newMessage);
      }
      setNewMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const toggleTool = (tool) => {
    setNewAssistant((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter((t) => t !== tool)
        : [...prev.tools, tool],
    }));
  };

  // Handle error states
  const renderError = (error) => {
    if (!error) return null;
    return typeof error === "string"
      ? error
      : error.message || "An error occurred";
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Tabs
        defaultValue="assistants"
        orientation="vertical"
        className="flex w-full"
        onValueChange={(value) => {
          document.querySelector(`[data-tab-value="${value}"]`)?.click();
        }}
      >
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/30">
          <TabsList className="flex h-full w-full flex-col items-stretch justify-start space-y-2 bg-transparent p-2">
            <TabsTrigger
              value="create"
              className="w-full justify-start gap-2 px-4 py-2"
            >
              <Plus className="h-5 w-5" />
              Create Assistant
            </TabsTrigger>
            <TabsTrigger
              value="assistants"
              className="w-full justify-start gap-2 px-4 py-2"
            >
              <Users className="h-5 w-5" />
              Assistant List
            </TabsTrigger>
            <TabsTrigger
              value="threads"
              className="w-full justify-start gap-2 px-4 py-2"
            >
              <MessageSquare className="h-5 w-5" />
              Thread List
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="w-full justify-start gap-2 px-4 py-2"
            >
              <MessageSquare className="h-5 w-5" />
              Thread Messages
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {typeof error === "string"
                      ? error
                      : error.message || "An error occurred"}
                  </AlertDescription>
                </Alert>
              )}
              <TabsContent value="create" className="mt-0 border-0">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    Create New Assistant
                  </h2>
                  <AssistantForm
                    newAssistant={newAssistant}
                    setNewAssistant={setNewAssistant}
                    createAssistant={handleCreateAssistant}
                    loading={assistantsLoading}
                    toggleTool={toggleTool}
                    selectedAssistant={selectedAssistant}
                    setSelectedAssistant={setSelectedAssistant}
                    handleAssistantSelect={handleAssistantSelect}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="assistants" className="mt-0 border-0">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Assistants</h2>
                  <AssistantList
                    assistants={assistants}
                    selectedAssistant={selectedAssistant}
                    onAssistantSelect={handleAssistantSelect}
                    onStartRun={handleStartRun}
                    isRunning={isRunning}
                    loading={loading}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="threads" className="mt-0 border-0">
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Threads</h2>
                    <Button
                      onClick={handleCreateThread}
                      disabled={!selectedAssistant || loading}
                    >
                      Create Thread
                    </Button>
                  </div>
                  <ThreadList
                    threads={filteredThreads}
                    expandedThreads={expandedThreads}
                    toggleThread={toggleThread}
                    threadMessages={threadMessages}
                    fetchThreadMessages={fetchThreadMessages}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    sendMessage={handleSendMessage}
                    createThread={createThread}
                    deleteThread={deleteThread}
                    selectedAssistant={selectedAssistant}
                    loading={loading}
                    streaming={streaming}
                    setStreaming={setStreaming}
                    streamingMessages={streamingMessages}
                    onThreadExpand={handleThreadExpand}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="mt-0 border-0">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Thread Messages</h2>
                  <ThreadMessages
                    threadMessages={threadMessages}
                    loading={threadsLoading}
                    selectedAssistant={selectedAssistant}
                    streamingMessages={streamingMessages}
                  />
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </div>
      </Tabs>
      {error && <div className="text-red-500 p-4">{renderError(error)}</div>}
      <ChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        isLoading={status === "polling"}
        assistant={selectedAssistant}
        error={error}
      />
    </div>
  );
}

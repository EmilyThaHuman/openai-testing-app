import React, { useState, useMemo, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOpenAI } from "@/context/OpenAIContext";
import { useToast } from "@/components/ui/use-toast";
import AssistantForm from "../../assistants/AssistantForm";
import AssistantList from "../../assistants/AssistantList";
import ThreadList from "../../assistants/ThreadList";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  Database,
  File,
  MessageSquare,
  Plus,
  Store,
  Users,
  XCircle,
} from "lucide-react";
import { DEFAULT_ASSISTANT } from "../../../constants/assistantConstants";
import { useAssistants } from "@/hooks/use-assistants";
import ThreadMessages from "../../assistants/ThreadMessages";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useActiveRun } from "@/hooks/use-active-run";
import ChatDialog from "@/components/chat/ChatDialog";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import { FileUploadDialog } from "@/components/shared/FileUploadDialog";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { AssistantToolsManager } from "@/components/assistants/AssistantToolsManager";
import { VectorStoreManagement } from "@/components/vector-store/VectorStoreManagement";
import { FileManagement } from "@/components/shared/FileManagement";
import { useStore, useStoreShallow } from "@/store/useStore";
import { ThreadsManager } from "@/components/assistants/ThreadsManager";
import { Input } from "@/components/ui/input";

export default function AssistantTesting() {
  const { apiKey } = useOpenAI();
  const { toast } = useToast();
  const vectorStore = useStoreShallow((state) => ({
    vectorStores: state.vectorStores,
    loading: state.loading,
    error: state.error,
    fetchVectorStores: state.fetchVectorStores,
    createVectorStore: state.createVectorStore,
    deleteVectorStore: state.deleteVectorStore,
    selectedVectorStore: state.selectedVectorStore,
    setSelectedVectorStore: state.setSelectedVectorStore,
  }));
  // State
  const [newAssistant, setNewAssistant] = useState(DEFAULT_ASSISTANT);
  const [newMessage, setNewMessage] = useState("");

  const [chatOpen, setChatOpen] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(new Map());
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null); // Add error state

  const fetchRef = React.useRef(false);

  // Custom hooks
  const {
    // Core state
    assistants,
    selectedAssistant,
    loading: assistantsLoading,
    error: assistantsError,
    streaming,
    streamingChatMessages,
    assistantChatMessages,
    setStreaming,
    setAssistantChatMessages,
    setStreamingChatMessages,
    threadMessages,
    selectedThread,
    setSelectedThread,
    expandedThreads,

    // Actions
    setSelectedAssistant,
    fetchAssistants,
    createAssistant,
    handleFileUpload: uploadAssistantFile,
    sendMessage,
    createThread,
    deleteThread,
    toggleThread,
    createStreamedThreadWithMessage,
    fetchThreadsForAssistant,

    // Thread & Message operations
    getThreads,
    getThreadMessages,
    isThreadExpanded,

    // Feedback and regeneration
    regenerateResponse,
    submitFeedback,
  } = useAssistants();

  useEffect(() => {
    if (apiKey) {
      fetchAssistants();
    }
  }, [apiKey, fetchAssistants]);


  useEffect(() => {
    setError(assistantsError);
  }, [assistantsError]);

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
  const loading = assistantsLoading;

  const threads = getThreads(selectedAssistant?.id);

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
        setAssistantChatMessages(messages);
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
        setAssistantChatMessages(messages);
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

  const handleThreadSelect = useCallback(
    async ({ thread, assistant }) => {
      try {
        // Save previous selection state
        const previousThread = selectedThread;

        // Update selection immediately for UI responsiveness
        setSelectedThread(thread);

        if (!thread.id) {
          console.error("Invalid thread ID");
          return;
        }

        // Fetch the full thread details if we haven't already
        const threadDetails = await UnifiedOpenAIService.threads.get(thread.id);

        // Update thread messages in state
        const messages = threadDetails.messages?.data || [];
        setAssistantChatMessages(messages);

        // Start a new run if assistant is selected
        if (assistant && !isRunning) {
          await startNewRun(assistant, {
            threadId: thread.id,
          });
        }

        // Open chat dialog if we have messages
        if (messages.length > 0) {
          setChatOpen(true);
        }
      } catch (error) {
        console.error("Error selecting thread:", error);
        setError(error);
        // Revert selection on error
        setSelectedThread(previousThread);

        toast({
          title: "Error selecting thread",
          description: error.message || "Failed to load thread details",
          variant: "destructive",
        });
      }
    },
    [
      selectedThread,
      setSelectedThread,
      setAssistantChatMessages,
      startNewRun,
      isRunning,
      toast,
    ]
  );

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

  const handleFileUpload = useCallback(
    async (filesInput) => {
      // Normalize input to array
      const files = Array.isArray(filesInput) ? filesInput : [filesInput];

      try {
        setUploading(true);

        // Initialize upload tracking for new files
        setUploadingFiles(
          new Map(
            files.map((file) => [file.name, { progress: 0, status: "pending" }])
          )
        );

        const uploadResults = await Promise.all(
          files.map(async (file) => {
            try {
              // Update status to uploading
              setUploadingFiles((prev) =>
                new Map(prev).set(file.name, {
                  progress: 0,
                  status: "uploading",
                })
              );

              // Upload to OpenAI
              const openAIFile = await UnifiedOpenAIService.files.create({
                file,
                purpose: "assistants",
                onProgress: (progress) => {
                  setUploadingFiles((prev) =>
                    new Map(prev).set(file.name, {
                      progress,
                      status: "uploading",
                    })
                  );
                },
              });

              // Update status to attaching
              setUploadingFiles((prev) =>
                new Map(prev).set(file.name, {
                  progress: 100,
                  status: "attaching",
                })
              );

              // Attach to assistant if one is selected
              if (selectedAssistant?.id) {
                await UnifiedOpenAIService.assistants.files.create(
                  selectedAssistant.id,
                  openAIFile.id
                );
              }

              // Update status to complete
              setUploadingFiles((prev) =>
                new Map(prev).set(file.name, {
                  progress: 100,
                  status: "complete",
                })
              );

              return { success: true, file: openAIFile };
            } catch (error) {
              // Update status to error
              setUploadingFiles((prev) =>
                new Map(prev).set(file.name, {
                  progress: 0,
                  status: "error",
                  error: error.message,
                })
              );

              return { success: false, error, fileName: file.name };
            }
          })
        );

        // Process results
        const successful = uploadResults.filter((result) => result.success);
        const failed = uploadResults.filter((result) => !result.success);

        // Update assistant data if any files were successfully attached
        if (selectedAssistant?.id && successful.length > 0) {
          const updatedAssistant =
            await UnifiedOpenAIService.assistants.retrieve(
              selectedAssistant.id
            );
          setSelectedAssistant(updatedAssistant);
          await fetchAssistants(); // Refresh assistants list
        }

        // Show appropriate toast messages
        if (successful.length > 0) {
          toast({
            title: "Files Uploaded",
            description: `Successfully uploaded ${successful.length} file${successful.length === 1 ? "" : "s"}`,
          });
        }

        if (failed.length > 0) {
          failed.forEach(({ fileName, error }) => {
            toast({
              title: `Failed to upload ${fileName}`,
              description: error.message,
              variant: "destructive",
            });
          });
        }

        return successful.map((result) => result.file);
      } catch (error) {
        console.error("File upload error:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to upload files",
          variant: "destructive",
        });
        setError(error);
        return [];
      } finally {
        setUploading(false);
        // Clear upload tracking after a delay
        setTimeout(() => setUploadingFiles(new Map()), 2000);
      }
    },
    [selectedAssistant?.id, toast, fetchAssistants]
  );

  // Handler for single file upload (e.g., from a button or drag-drop)
  const handleSingleFileUpload = useCallback(
    async (file) => {
      const result = await handleFileUpload(file);
      return result[0]; // Return the first (and only) result
    },
    [handleFileUpload]
  );

  const handleCreateStore = async () => {
    try {
      await createVectorStore({
        name: "My Vector Store",
        description: "Description here",
      });
    } catch (error) {
      console.error("Failed to create vector store:", error);
    }
  };

  const handleVectorStoreFileUpload = async (vectorStoreId, file) => {
    try {
      await files.upload(vectorStoreId, {
        file,
        purpose: "assistants",
      });
    } catch (error) {
      console.error("Failed to upload file:", error);
    }
  };

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

    const assistantData = {
      name: newAssistant.name.trim(),
      instructions: newAssistant.instructions.trim(),
      model: newAssistant.model,
      tools: newAssistant.tools.map((tool) => ({ type: tool })),
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

    try {
      await createAssistant(assistantData);
      setNewAssistant(DEFAULT_ASSISTANT);
    } catch (error) {
      setError(error);
      console.error("Failed to create assistant:", error);
    }
  };

  const handleSendMessage = async (threadId) => {
    if (!newMessage.trim() || loading) return;

    try {
      if (streaming) {
        const stream = await sendMessage(threadId, newMessage, {
          stream: true,
        });
        for await (const chunk of stream) {
          if (chunk.choices?.[0]?.delta?.content) {
            setStreamingChatMessages((prev) => ({
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
  // Memoize filtered threads
  const filteredThreads = useMemo(() => {
    const threadsArray = Array.isArray(threads) ? threads : [];
    return selectedAssistant
      ? threadsArray.filter(
          (thread) => thread.metadata?.assistantId === selectedAssistant.id
        )
      : [];
  }, [threads, selectedAssistant]);

  // Update the renderError function
  const renderError = (error) => {
    if (!error) return null;

    // Handle different error types
    if (typeof error === "string") {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "object" && error !== null) {
      return error.message || "An unknown error occurred";
    }

    return "An unknown error occurred";
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{renderError(error)}</AlertDescription>
        </Alert>
      )} */}
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
            <TabsTrigger
              value="files"
              className="w-full justify-start gap-2 px-4 py-2"
            >
              <File className="h-5 w-5" />
              Files
            </TabsTrigger>
            <TabsTrigger
              value="vector-store"
              className="w-full justify-start gap-2 px-4 py-2"
            >
              <Store className="h-5 w-5" />
              Vector Store
            </TabsTrigger>
            <TabsTrigger
              value="embeddings"
              className="w-full justify-start gap-2 px-4 py-2"
            >
              <Database className="h-5 w-5" />
              Embeddings
            </TabsTrigger>
            <TabsTrigger
              value="tools"
              className="w-full justify-start gap-2 px-4 py-2"
            >
              <Database className="h-5 w-5" />
              Tools
            </TabsTrigger>
            <TabsTrigger
              value="threads"
              className="w-full justify-start gap-2 px-4 py-2"
            >
              <MessageSquare className="h-5 w-5" />
              Threads
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="w-full justify-start gap-2 px-4 py-2"
            >
              <MessageSquare className="h-5 w-5" />
              Assistant Chat
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {error && <ErrorDisplay error={error} />}
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
                    isFileDialogOpen={isFileDialogOpen}
                    setIsFileDialogOpen={setIsFileDialogOpen}
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
                    threads={threads}
                    loading={loading}
                    selectedAssistant={selectedAssistant}
                    selectedThread={selectedThread}
                    onThreadSelect={handleThreadSelect}
                    expandedThreads={expandedThreads}
                    onThreadExpand={handleThreadExpand}
                    assistants={assistants}
                    onCreateThread={handleCreateThread}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="mt-0 border-0">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Thread Messages</h2>
                  <ThreadMessages
                    threadMessages={threadMessages}
                    loading={loading}
                    selectedAssistant={selectedAssistant}
                    streamingMessages={streamingChatMessages}
                  />
                </Card>
              </TabsContent>
              <TabsContent value="files" className="mt-0 border-0">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Files</h2>
                  <FileManagement
                    onAttach={(files, options) => {
                      // Handle file attachment
                      console.log("Files:", files);
                      console.log("Options:", options); // { chunkSize: 800, chunkOverlap: 400 }
                    }}
                    onCancel={() => {
                      // Handle cancellation
                    }}
                  />
                </Card>
              </TabsContent>
              <TabsContent value="vector-store" className="mt-0 border-0">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Vector Store</h2>
                  <VectorStoreManagement
                    createVectorStore={handleCreateStore}
                    listVectorStores={vectorStore.fetchVectorStores}
                    vectorStoresLoading={vectorStore.loading}
                    vectorStoresError={vectorStore.error}
                    onFileUpload={handleVectorStoreFileUpload}
                    onSelect={(storeId) => {
                      // Handle store selection
                      console.log("Store selected:", storeId);
                      setSelectedVectorStore(storeId);
                    }}
                    onBack={() => {
                      // Handle back navigation
                    }}
                    onCancel={() => {
                      // Handle cancel action
                    }}
                  />
                </Card>
              </TabsContent>
              <TabsContent value="embeddings" className="mt-0 border-0">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Embeddings</h2>
                </Card>
              </TabsContent>
              <TabsContent value="tools" className="mt-0 border-0">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Tools</h2>
                  <AssistantToolsManager />
                </Card>
              </TabsContent>
              <TabsContent value="threads" className="mt-0 border-0">
                <Card className="p-6">
                  <ThreadsManager
                    selectedAssistant={selectedAssistant}
                    onThreadSelect={handleThreadSelect}
                    selectedThread={selectedThread}
                  />
                </Card>
              </TabsContent>
              <TabsContent value="chat" className="mt-0 border-0">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Assistant Chat</h2>
                  <p>
                    This is the assistant chat tab. Here you can chat with the
                    assistant.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button
                      onClick={() => handleSendMessage(selectedThread.id)}
                    >
                      Send Message
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </div>
      </Tabs>
      {error && <div className="text-red-500 p-4">{renderError(error)}</div>}
      {/* Chat Dialog */}
      <ChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        messages={assistantChatMessages}
        onSendMessage={handleChatMessage}
        onFileUpload={handleSingleFileUpload}
        onRegenerate={regenerateResponse}
        onFeedback={submitFeedback}
        isLoading={status === "polling"}
        assistant={selectedAssistant}
        error={error}
      />
      {/* File Upload Dialog */}
      <FileUploadDialog
        open={isFileDialogOpen}
        onClose={() => setIsFileDialogOpen(false)}
        onUpload={handleFileUpload}
        purpose="assistants"
        uploadProgress={uploadingFiles}
        setUploadProgress={setUploadingFiles}
        uploading={uploading}
        setUploading={setUploading}
      />
      {/* Add upload progress indicator */}
      {uploadingFiles.size > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <AnimatePresence>
            {Array.from(uploadingFiles.entries()).map(([fileName, status]) => (
              <motion.div
                key={fileName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-background border rounded-lg shadow-lg p-4 mb-2 w-80"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate flex-1">
                    {fileName}
                  </span>
                  {status.status === "complete" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {status.status === "error" && (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <Progress
                  value={status.progress}
                  className="h-1"
                  variant={
                    status.status === "error" ? "destructive" : "default"
                  }
                />
                <span className="text-xs text-muted-foreground mt-1">
                  {status.status === "uploading" && "Uploading..."}
                  {status.status === "attaching" && "Attaching to assistant..."}
                  {status.status === "complete" && "Upload complete"}
                  {status.status === "error" && status.error}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

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
  const { apiKey } = useOpenAI() || {};
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
  const [activeAssistantTab, setActiveAssistantTab] = useState("assistants");
  const [assistantFormMode, setAssistantFormMode] = useState("create");
  const [isEditing, setIsEditing] = useState(false);
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
    threadMessages,
    selectedThread,
    expandedThreads,

    // Setters
    setStreaming,
    setAssistantChatMessages,
    setStreamingChatMessages,
    setSelectedThread,
    setSelectedAssistant,
    setThreads,

    // Actions
    fetchAssistants,
    createAssistant,
    updateAssistant,
    handleFileUpload: uploadAssistantFile,
    sendMessage,
    createThread,
    deleteThread,
    toggleThread,
    createStreamedThreadWithMessage,
    fetchThreadsForAssistant,
    submitFeedback,
    regenerateResponse,

    // Selectors
    getThreads,
    getThreadMessages,
    isThreadExpanded,
  } = useAssistants();

  useEffect(() => {
    if (apiKey && !fetchRef.current) {
      fetchRef.current = true;
      fetchAssistants().catch((err) => {
        setError(err.message);
      });
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
      // Reset selected thread
      setSelectedThread(null);
      console.log("Selecting thread:", thread);
      console.log("Selecting assistant:", assistant);
      // Save previous selection state
      const previousThread = selectedThread;
      try {
        if (!thread.id) {
          console.error("Invalid thread ID");
          return;
        }

        // Update selection immediately for UI responsiveness
        setSelectedThread(thread);

        // Fetch the full thread details if we haven't already
        const threadDetails = await UnifiedOpenAIService.threads.get(thread.id);
        console.log("threadDetails", threadDetails);
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
        if (previousThread) {
          // Revert selection on error
          setSelectedThread(previousThread);
        }
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

  const handleCreateThread = useCallback(
    async (selectedAssistantId, initialMessage) => {
      if (!selectedAssistantId) return;

      try {
        const thread = await createThread();
        await startNewRun(selectedAssistantId, {
          threadId: thread.id,
          initialMessage: initialMessage,
        });
      } catch (err) {
        setError(err);
        console.error("Failed to create thread:", err);
      }
    },
    [selectedAssistant, createThread, startNewRun]
  );

  const handleFileUpload = useCallback( 
    async (filesInput) => {
      const files = Array.isArray(filesInput) ? filesInput : [filesInput];

      try {
        setUploading(true);
        setUploadingFiles(new Map(
          files.map((file) => [file.name, { progress: 0, status: "pending" }])
        ));

        const uploadResults = await Promise.all(files.map(async (file) => {
          try {
            setUploadingFiles((prev) => new Map(prev).set(file.name, {
              progress: 0, status: "uploading"
            }));

            const openAIFile = await UnifiedOpenAIService.files.create({
              file,
              purpose: "assistants",
              onProgress: (progress) => {
                setUploadingFiles((prev) => new Map(prev).set(file.name, {
                  progress, status: "uploading"
                }));
              },
            });

            if (selectedAssistant?.id) {
              await UnifiedOpenAIService.assistants.files.create(selectedAssistant.id, openAIFile.id);
            }

            setUploadingFiles((prev) => new Map(prev).set(file.name, {
              progress: 100, status: "complete"
            }));

            return { success: true, file: openAIFile };
          } catch (error) {
            setUploadingFiles((prev) => new Map(prev).set(file.name, {
              progress: 0, status: "error", error: error.message
            }));
            return { success: false, error, fileName: file.name };
          }
        }));

        const successfulUploads = uploadResults.filter((result) => result.success);
        if (selectedAssistant?.id && successfulUploads.length > 0) {
          const updatedAssistant = await UnifiedOpenAIService.assistants.retrieve(selectedAssistant.id);
          setSelectedAssistant(updatedAssistant);
          await fetchAssistants();
        }

        successfulUploads.length > 0 && toast({
          title: "Files Uploaded",
          description: `Successfully uploaded ${successfulUploads.length} file(s)`,
        });

        uploadResults.filter(({ success }) => !success).forEach(({ fileName, error }) => {
          toast({
            title: `Failed to upload ${fileName}`,
            description: error.message,
            variant: "destructive",
          });
        });

        return successfulUploads.map((result) => result.file);
      } catch (error) {
        console.error("File upload error:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to upload files",
          variant: "destructive",
        });
        setError(error);
        return [];
      } finally {
        setUploading(false);
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

  const handleCreateStore = async (name) => {
    try {
      await vectorStore.createVectorStore({
        name: name || "My Vector Store",
      });
    } catch (error) {
      console.error("Failed to create vector store:", error);
    }
  };

  const handleVectorStoreFileUpload = async (vectorStoreId, files) => {
    try {
      if (files.length === 0) return;
      if (files.length === 1) {
         const file = await UnifiedOpenAIService.files.create({
          file: files[0],
          purpose: "fine-tune",
        });
      }
      if (files.length > 1) {
        const fileStreams = files.map(path => fs.createReadStream(path));
        await UnifiedOpenAIService.beta.vectorStores.fileBatches.uploadAndPoll({
          vector_store_id: vectorStoreId,
          file_batches: fileStreams,
        });
        await UnifiedOpenAIService.beta.assistants.update(selectedAssistant.id, { 
          tool_resources: { file_search: { vector_store_ids: [vectorStoreId] } },
        });
      }
    } catch (error) {
      console.error("Failed to upload file:", error);
    }
  };

  const handleThreadExpand = (threadId) => {
    toggleThread(new Set([threadId]));
    console.log("Thread expanded:", threadId);
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

  const handleUpdateAssistant = async (assistantId, updateData) => {
    console.log("Updating assistant:", assistantId, updateData);
    await updateAssistant(assistantId, updateData);
  };

  const handleStartEdit = async (assistant) => {
    setSelectedAssistant(assistant);
    setAssistantFormMode("edit");
    setIsEditing(true);
    setActiveAssistantTab("create");
  };

  const handleAssistantFormSubmit = async (assistant) => {
    assistantFormMode === "create" ? handleCreateAssistant(assistant) : handleUpdateAssistant(assistant.id, assistant);
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

  if (!apiKey) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          OpenAI API key is not configured. Please add your API key in settings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Tabs
        value={activeAssistantTab}
        defaultValue="assistants"
        orientation="vertical"
        className="flex w-full"
        onValueChange={setActiveAssistantTab} // Update state directly

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
                    mode={assistantFormMode}
                    newAssistant={newAssistant}
                    loading={assistantsLoading}
                    assistant={selectedAssistant}
                    setSelectedAssistant={setSelectedAssistant}
                    isFileDialogOpen={isFileDialogOpen}
                    handleAssistantSelect={handleAssistantSelect}
                    setNewAssistant={setNewAssistant}
                    createAssistant={handleCreateAssistant}
                    setIsFileDialogOpen={setIsFileDialogOpen}
                    onSubmit={handleAssistantFormSubmit}
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
                    onStartEdit={handleStartEdit}
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
                  </div>
                  <ThreadList
                    threads={threads}
                    loading={loading}
                    selectedAssistant={selectedAssistant}
                    selectedThread={selectedThread}
                    expandedThreads={expandedThreads}
                    assistants={assistants}
                    onThreadSelect={handleThreadSelect}
                    onThreadExpand={handleThreadExpand}
                    onCreateThread={handleCreateThread}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="mt-0 border-0">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Thread Messages</h2>
                  <ThreadMessages />
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
      {/* {error && <div className="text-red-500 p-4">{renderError(error)}</div>} */}
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

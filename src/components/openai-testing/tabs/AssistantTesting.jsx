import React from 'react';
import { useStoreSelector } from '@/store/useStore';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Database, File, MessageSquare, Plus, Store, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import AssistantForm from "../../assistants/AssistantForm";
import AssistantList from "../../assistants/AssistantList";
import ThreadList from "../../assistants/ThreadList";
import ThreadMessages from "../../assistants/ThreadMessages";
import ChatDialog from "@/components/chat/ChatDialog";
import { FileUploadDialog } from "@/components/shared/FileUploadDialog";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { AssistantToolsManager } from "@/components/assistants/AssistantToolsManager";
import { VectorStoreManagement } from "@/components/vector-store/VectorStoreManagement";
import { FileManagement } from "@/components/shared/FileManagement";
import { ThreadsManager } from "@/components/assistants/ThreadsManager";

export default function AssistantTesting() {
  const {
    // Core state
    assistants,
    selectedAssistant,
    loading,
    error,
    activeTab,
    chatOpen,
    isFileDialogOpen,
    uploadingFiles,
    uploading,
    messages,
    newMessage,

    // Actions
    setActiveTab,
    setChatOpen,
    setIsFileDialogOpen,
    setUploadingFiles,
    setUploading,
    setNewMessage,
    createAssistant,
    updateAssistant,
    deleteAssistant,
    handleFileUpload,
    handleChatMessage,
    handleStartRun,
    handleThreadSelect,
    handleCreateThread,
    handleStartEdit,
    regenerateResponse,
    submitFeedback,
    createVectorStore,
    handleVectorStoreFileUpload

  } = useStoreSelector(state => ({
    // Core state
    assistants: state.assistants,
    selectedAssistant: state.selectedAssistant,
    loading: state.loading,
    error: state.error,
    activeTab: state.activeTab,
    chatOpen: state.chatOpen,
    isFileDialogOpen: state.isFileDialogOpen,
    uploadingFiles: state.uploadingFiles,
    uploading: state.uploading,
    messages: state.assistantChatMessages,
    newMessage: state.newMessage,

    // Actions
    setActiveTab: state.setActiveTab,
    setChatOpen: state.setChatOpen,
    setIsFileDialogOpen: state.setIsFileDialogOpen,
    setUploadingFiles: state.setUploadingFiles,
    setUploading: state.setUploading,
    setNewMessage: state.setNewMessage,
    createAssistant: state.createAssistant,
    updateAssistant: state.updateAssistant,
    deleteAssistant: state.deleteAssistant,
    handleFileUpload: state.handleFileUpload,
    handleChatMessage: state.handleChatMessage,
    handleStartRun: state.handleStartRun,
    handleThreadSelect: state.handleThreadSelect,
    handleCreateThread: state.handleCreateThread,
    handleStartEdit: state.handleStartEdit,
    regenerateResponse: state.regenerateResponse,
    submitFeedback: state.submitFeedback,
    createVectorStore: state.createVectorStore,
    handleVectorStoreFileUpload: state.handleVectorStoreFileUpload
  }));

  if (!selectedAssistant?.apiKey) {
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
        value={activeTab}
        defaultValue="assistants"
        orientation="vertical"
        className="flex w-full"
        onValueChange={setActiveTab}
      >
        {/* Sidebar Navigation */}
        <div className="w-64 border-r bg-muted/30">
          <TabsList className="flex h-full w-full flex-col items-stretch justify-start space-y-2 bg-transparent p-2">
            <TabsTrigger value="create" className="w-full justify-start gap-2 px-4 py-2">
              <Plus className="h-5 w-5" />
              Create Assistant
            </TabsTrigger>
            <TabsTrigger value="assistants" className="w-full justify-start gap-2 px-4 py-2">
              <Users className="h-5 w-5" />
              Assistant List
            </TabsTrigger>
            <TabsTrigger value="threads" className="w-full justify-start gap-2 px-4 py-2">
              <MessageSquare className="h-5 w-5" />
              Thread List
            </TabsTrigger>
            <TabsTrigger value="messages" className="w-full justify-start gap-2 px-4 py-2">
              <MessageSquare className="h-5 w-5" />
              Thread Messages
            </TabsTrigger>
            <TabsTrigger value="files" className="w-full justify-start gap-2 px-4 py-2">
              <File className="h-5 w-5" />
              Files
            </TabsTrigger>
            <TabsTrigger value="vector-store" className="w-full justify-start gap-2 px-4 py-2">
              <Store className="h-5 w-5" />
              Vector Store
            </TabsTrigger>
            <TabsTrigger value="tools" className="w-full justify-start gap-2 px-4 py-2">
              <Database className="h-5 w-5" />
              Tools
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {error && <ErrorDisplay error={error} />}

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="create">
                    <AssistantForm
                      onSubmit={createAssistant}
                      loading={loading}
                    />
                  </TabsContent>

                  <TabsContent value="assistants">
                    <AssistantList
                      assistants={assistants}
                      selectedAssistant={selectedAssistant}
                      onStartEdit={handleStartEdit}
                      onStartRun={handleStartRun}
                      loading={loading}
                    />
                  </TabsContent>

                  <TabsContent value="threads">
                    <ThreadsManager
                      onThreadSelect={handleThreadSelect}
                      selectedThread={selectedAssistant?.thread}
                    />
                  </TabsContent>

                  <TabsContent value="messages">
                    <ThreadMessages />
                  </TabsContent>

                  <TabsContent value="files">
                    <FileManagement onAttach={handleFileUpload} />
                  </TabsContent>

                  <TabsContent value="vector-store">
                    <VectorStoreManagement
                      createVectorStore={createVectorStore}
                      onFileUpload={handleVectorStoreFileUpload}
                    />
                  </TabsContent>

                  <TabsContent value="tools">
                    <AssistantToolsManager />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </Tabs>

      {/* Dialogs */}
      <ChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        messages={messages}
        onSendMessage={handleChatMessage}
        onFileUpload={handleFileUpload}
        onRegenerate={regenerateResponse}
        onFeedback={submitFeedback}
        isLoading={loading}
        assistant={selectedAssistant}
        error={error}
      />

      <FileUploadDialog
        open={isFileDialogOpen}
        onClose={() => setIsFileDialogOpen(false)}
        onUpload={handleFileUpload}
        uploadProgress={uploadingFiles}
        uploading={uploading}
      />
    </div>
  );
}

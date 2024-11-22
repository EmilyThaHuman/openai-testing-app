import React, { useEffect, useCallback, useState } from 'react';
import { useStore } from '@/store/useStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  Database,
  File,
  Key,
  MessageSquare,
  Plus,
  Store,
  Users,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Components
import AssistantForm from '../../assistants/AssistantForm';
import AssistantList from '../../assistants/AssistantList';
import ChatDialog from '@/components/chat/ChatDialog';
import { FileUploadDialog } from '@/components/shared/FileUploadDialog';
import { ErrorDisplay } from '@/components/shared/ErrorDisplay';
import { AssistantToolsManager } from '@/components/assistants/AssistantToolsManager';
import { VectorStoreManagement } from '@/components/vector-store/VectorStoreManagement';
import { FileManagement } from '@/components/shared/FileManagement';
import { ThreadsManager } from '@/components/assistants/ThreadsManager';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

export default function AssistantTesting() {
  // Get state from store with more granular loading states
  const {
    assistants,
    selectedAssistant,
    loading,
    isInitializing,
    error,
    activeTab,
    chatOpen,
    isFileDialogOpen,
    uploadingFiles,
    uploading,
    messages,
    apiKey,
    isInitialized,
    // Actions
    setActiveTab,
    setChatOpen,
    setIsFileDialogOpen,
    setUploadingFiles,
    setUploading,
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
    handleVectorStoreFileUpload,
    initialize,
    setApiKey,
    fetchAssistants,
  } = useStore(state => ({
    assistants: state.assistants,
    selectedAssistant: state.selectedAssistant,
    loading: state.loading,
    isInitializing: state.isInitializing,
    error: state.error,
    activeTab: state.activeTab,
    chatOpen: state.chatOpen,
    isFileDialogOpen: state.isFileDialogOpen,
    uploadingFiles: state.uploadingFiles,
    uploading: state.uploading,
    messages: state.assistantChatMessages,
    apiKey: state.apiKey,
    isInitialized: state.isInitialized,
    setActiveTab: state.setActiveTab,
    setChatOpen: state.setChatOpen,
    setIsFileDialogOpen: state.setIsFileDialogOpen,
    setUploadingFiles: state.setUploadingFiles,
    setUploading: state.setUploading,
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
    handleVectorStoreFileUpload: state.handleVectorStoreFileUpload,
    initialize: state.initialize,
    setApiKey: state.setApiKey,
    fetchAssistants: state.fetchAssistants,
  }));

  const { toast } = useToast();
  const [hasFetched, setHasFetched] = useState(false);

  // Add initialization effect with better state management
  useEffect(() => {
    const initializeAssistants = async () => {
      if (!apiKey || hasFetched) return;

      try {
        if (!isInitialized) {
          await initialize(apiKey);
        }

        await fetchAssistants(true);
        setHasFetched(true);
      } catch (error) {
        console.error('Failed to initialize assistants:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to initialize assistants',
          variant: 'destructive',
        });
      }
    };

    initializeAssistants();
  }, [apiKey, isInitialized, initialize, fetchAssistants, hasFetched, toast]);

  // Add tab change handler with loading state check
  const handleTabChange = useCallback(async (tab) => {
    setActiveTab(tab);
    if (tab === 'assistants' && apiKey && isInitialized && !hasFetched) {
      try {
        await fetchAssistants(true);
        setHasFetched(true);
      } catch (error) {
        console.error('Failed to fetch assistants:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch assistants',
          variant: 'destructive',
        });
      }
    }
  }, [setActiveTab, apiKey, isInitialized, fetchAssistants, hasFetched, toast]);

  // Handle API key submission
  const handleApiKeySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const key = formData.get('apiKey');

    if (!key) {
      toast({
        title: 'Error',
        description: 'Please enter an API key',
        variant: 'destructive',
      });
      return;
    }

    try {
      await setApiKey(key);
      await initialize(key);
      await fetchAssistants();
      toast({
        title: 'Success',
        description: 'API key set successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to set API key',
        variant: 'destructive',
      });
    }
  };

  // Show loading state only during initialization
  if (isInitializing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-screen"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </motion.div>
    );
  }

  // Show API key form if not set
  if (!apiKey) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container max-w-2xl mx-auto py-8"
      >
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            Please set your OpenAI API key to use the assistants feature.
          </AlertDescription>
        </Alert>

        <Card className="p-6">
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Enter OpenAI API Key</h3>
              <p className="text-sm text-muted-foreground">
                Your API key will be stored securely in your browser&apos;s local storage.
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                name="apiKey"
                type="password"
                placeholder="sk-..."
                className="flex-1"
                required
              />
              <Button type="submit" className="gap-2">
                <Key className="w-4 h-4" />
                Set API Key
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-[calc(100vh-4rem)]"
    >
      <Tabs
        value={activeTab}
        defaultValue="assistants"
        orientation="vertical"
        className="flex w-full"
        onValueChange={handleTabChange}
      >
        {/* Sidebar Navigation */}
        <div className="w-64 border-r bg-muted/30">
          <TabsList className="flex h-full w-full flex-col items-stretch justify-start space-y-2 bg-transparent p-2">
            <TabsTrigger
              value="create"
              className={cn(
                "w-full justify-start gap-2 px-4 py-2",
                "data-[state=active]:bg-accent"
              )}
            >
              <Plus className="h-5 w-5" />
              Create Assistant
            </TabsTrigger>
            <TabsTrigger
              value="assistants"
              className={cn(
                "w-full justify-start gap-2 px-4 py-2",
                "data-[state=active]:bg-accent"
              )}
            >
              <Users className="h-5 w-5" />
              Assistant List
            </TabsTrigger>
            <TabsTrigger
              value="threads"
              className={cn(
                "w-full justify-start gap-2 px-4 py-2",
                "data-[state=active]:bg-accent"
              )}
            >
              <MessageSquare className="h-5 w-5" />
              Thread List
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className={cn(
                "w-full justify-start gap-2 px-4 py-2",
                "data-[state=active]:bg-accent"
              )}
            >
              <File className="h-5 w-5" />
              Files
            </TabsTrigger>
            <TabsTrigger
              value="vector-store"
              className={cn(
                "w-full justify-start gap-2 px-4 py-2",
                "data-[state=active]:bg-accent"
              )}
            >
              <Store className="h-5 w-5" />
              Vector Store
            </TabsTrigger>
            <TabsTrigger
              value="tools"
              className={cn(
                "w-full justify-start gap-2 px-4 py-2",
                "data-[state=active]:bg-accent"
              )}
            >
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

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="create" className="mt-0 border-0">
                    <Card className="p-6">
                      <AssistantForm
                        onSubmit={createAssistant}
                        loading={loading}
                      />
                    </Card>
                  </TabsContent>

                  <TabsContent value="assistants" className="mt-0 border-0">
                    <AssistantList
                      assistants={assistants}
                      selectedAssistant={selectedAssistant}
                      onStartEdit={handleStartEdit}
                      onStartRun={handleStartRun}
                      loading={loading && !hasFetched}
                      onCreateNew={() => handleTabChange('create')}
                    />
                  </TabsContent>

                  <TabsContent value="threads" className="mt-0 border-0">
                    <Card className="p-6">
                      <ThreadsManager
                        onThreadSelect={handleThreadSelect}
                        selectedThread={selectedAssistant?.thread}
                      />
                    </Card>
                  </TabsContent>

                  <TabsContent value="files" className="mt-0 border-0">
                    <Card className="p-6">
                      <FileManagement onAttach={handleFileUpload} />
                    </Card>
                  </TabsContent>

                  <TabsContent value="vector-store" className="mt-0 border-0">
                    <Card className="p-6">
                      <VectorStoreManagement
                        createVectorStore={createVectorStore}
                        onFileUpload={handleVectorStoreFileUpload}
                      />
                    </Card>
                  </TabsContent>

                  <TabsContent value="tools" className="mt-0 border-0">
                    <Card className="p-6">
                      <AssistantToolsManager />
                    </Card>
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
    </motion.div>
  );
}

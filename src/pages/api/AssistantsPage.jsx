import React from 'react';
import { useStoreSelector } from '@/store/useStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MessageSquare, Settings2, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import AssistantForm from '@/components/assistants/AssistantForm';
import AssistantList from '@/components/assistants/AssistantList';
import ThreadList from '@/components/assistants/ThreadList';
import ThreadMessages from '@/components/assistants/ThreadMessages';
import ChatDialog from '@/components/chat/ChatDialog';
import { AssistantToolsManager } from '@/components/assistants/AssistantToolsManager';

export function AssistantsPage() {
  const {
    activeTab,
    assistants,
    selectedAssistant,
    loading,
    error,
    chatOpen,
    messages,
    setActiveTab,
    setChatOpen,
    createAssistant,
    updateAssistant,
    deleteAssistant,
    handleStartRun,
    handleThreadSelect,
    handleStartEdit,
    handleChatMessage,
    handleFileUpload,
    regenerateResponse,
    submitFeedback,
  } = useStoreSelector(state => ({
    activeTab: state.assistantsActiveTab,
    assistants: state.assistants,
    selectedAssistant: state.selectedAssistant,
    loading: state.assistantsLoading,
    error: state.assistantsError,
    chatOpen: state.assistantChatOpen,
    messages: state.assistantChatMessages,
    setActiveTab: state.setAssistantsActiveTab,
    setChatOpen: state.setAssistantChatOpen,
    createAssistant: state.createAssistant,
    updateAssistant: state.updateAssistant,
    deleteAssistant: state.deleteAssistant,
    handleStartRun: state.startAssistantRun,
    handleThreadSelect: state.selectAssistantThread,
    handleStartEdit: state.startAssistantEdit,
    handleChatMessage: state.sendAssistantMessage,
    handleFileUpload: state.uploadAssistantFile,
    regenerateResponse: state.regenerateAssistantResponse,
    submitFeedback: state.submitAssistantFeedback,
  }));

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      <div className="container py-6">
        {' '}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="assistants" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Assistants
              </TabsTrigger>
              <TabsTrigger value="create" className="gap-2">
                <Plus className="h-4 w-4" />
                Create
              </TabsTrigger>
              <TabsTrigger value="tools" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Tools
              </TabsTrigger>
              <TabsTrigger value="threads" className="gap-2">
                <Database className="h-4 w-4" />
                Threads
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="assistants">
                <Card className="p-6">
                  <AssistantList
                    assistants={assistants}
                    selectedAssistant={selectedAssistant}
                    onStartEdit={handleStartEdit}
                    onStartRun={handleStartRun}
                    loading={loading}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="create">
                <Card className="p-6">
                  <AssistantForm
                    onSubmit={createAssistant}
                    loading={loading}
                    assistant={selectedAssistant}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="tools">
                <Card className="p-6">
                  <AssistantToolsManager />
                </Card>
              </TabsContent>

              <TabsContent value="threads">
                <Card className="p-6">
                  <ThreadList
                    threads={selectedAssistant?.threads}
                    selectedAssistant={selectedAssistant}
                    onThreadSelect={handleThreadSelect}
                  />
                  <ThreadMessages />
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
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
      </div>
    </div>
  );
}

export default AssistantsPage;

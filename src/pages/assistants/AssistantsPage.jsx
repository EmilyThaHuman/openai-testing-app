import React, { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { ChatDialog } from '@/components/chat/ChatDialog'
import { AssistantToolsManager } from '@/components/assistants/AssistantToolsManager'
import { ThreadsManager } from '@/components/assistants/ThreadsManager'

export function AssistantsPage() {
  const [activeTab, setActiveTab] = useState('tools')
  const [isChatOpen, setIsChatOpen] = useState(false)
  
  const {
    assistants,
    selectedAssistant,
    loading,
    error,
    fetchAssistants,
    setSelectedAssistant
  } = useStore(state => ({
    assistants: state.assistants,
    selectedAssistant: state.selectedAssistant,
    loading: state.loading,
    error: state.error,
    fetchAssistants: state.fetchAssistants,
    setSelectedAssistant: state.setSelectedAssistant
  }))

  useEffect(() => {
    fetchAssistants()
  }, [fetchAssistants])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Assistants</h1>
        <p className="text-muted-foreground mt-2">
          Manage your AI assistants and their configurations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tools">Tools & Configuration</TabsTrigger>
          <TabsTrigger value="threads">Conversations</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="mt-4">
          <Card className="p-6">
            <AssistantToolsManager
              onChatOpen={() => setIsChatOpen(true)}
            />
          </Card>
        </TabsContent>

        <TabsContent value="threads" className="mt-4">
          <Card className="p-6">
            <ThreadsManager
              onChatOpen={() => setIsChatOpen(true)}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <ChatDialog
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        assistant={selectedAssistant}
      />
    </div>
  )
}

export default AssistantsPage 
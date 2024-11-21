import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService'
import { useOpenAI } from '@/context/OpenAIContext'
import { useStoreShallow } from '@/store/useStore'
// import { AssistantStream } from "openai/lib/AssistantStream";

export default function AssistantsPage() {
  const { apiKey } = useOpenAI()
  const {
    assistants,
    selectedAssistant,
    loading,
    fetchAssistants,
    setSelectedAssistant,
    createAssistant
  } = useStoreShallow((state) => ({
    assistants: state.assistants,
    selectedAssistant: state.selectedAssistant,
    loading: state.loading,
    fetchAssistants: state.fetchAssistants,
    setSelectedAssistant: state.setSelectedAssistant,
    createAssistant: state.createAssistant
  }));

  const [threads, setThreads] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [input, setInput] = useState('')
  const [newAssistant, setNewAssistant] = useState({
    name: '',
    instructions: '',
    model: 'gpt-4-turbo-preview'
  })

  // Use a ref to prevent multiple fetches
  const initRef = useRef(false);

  useEffect(() => {
    if (apiKey && !initRef.current) {
      initRef.current = true;
      fetchAssistants();
    }
  }, [apiKey]);

  const createNewAssistant = async () => {
    setLoading(true)
    try {
      const assistant = await UnifiedOpenAIService.assistants.create(
        newAssistant.name,
        newAssistant.instructions,
        newAssistant.model
      )
      setAssistants(prev => [...prev, assistant])
      setNewAssistant({ name: '', instructions: '', model: 'gpt-4-turbo-preview' })
    } catch (error) {
      console.error('Error creating assistant:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchThreads();
  }, []);

  const createNewThread = async () => {
    if (!selectedAssistant) return;
    setLoading(true);
    try {
      const thread = await UnifiedOpenAIService.threads.create();
      const threads = JSON.parse(localStorage.getItem('openai_threads') || '[]');
      const updatedThreads = threads?.map(t => 
        t.id === thread.id 
          ? { ...t, assistant_id: selectedAssistant.id }
          : t
      );
      localStorage.setItem('openai_threads', JSON.stringify(updatedThreads));
      setThreads(updatedThreads);
      setSelectedThread(thread);
    } catch (error) {
      console.error('Error creating thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteThread = async (threadId) => {
    setLoading(true);
    try {
      await UnifiedOpenAIService.threads.delete(threadId);
      setThreads(prev => prev.filter(t => t.id !== threadId));
      if (selectedThread?.id === threadId) {
        setSelectedThread(null);
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchThreads = async () => {
    try {
      const response = await UnifiedOpenAIService.threads.list();
      setThreads(response.data);
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  const handleThreadSelect = async (thread) => {
    setSelectedThread(null);
    setLoading(true);
    try {
      const threadData = await UnifiedOpenAIService.threads.retrieve(thread.id);
      setSelectedThread(threadData);
    } catch (error) {
      console.error('Error fetching thread messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedThread || !selectedAssistant) return;
    
    setLoading(true);
    try {
      // Send the message
      await UnifiedOpenAIService.threads.messages.create(
        selectedThread.id, 
        input
      );
      
      // Run the assistant
      await UnifiedOpenAIService.threads.runs.create(
        selectedThread.id, 
        selectedAssistant.id
      );
      
      // Clear input
      setInput('');
      
      // Refresh thread messages
      const updatedThread = await UnifiedOpenAIService.threads.retrieve(selectedThread.id);
      setSelectedThread(updatedThread);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Assistants API Testing</h1>
      
      <Tabs defaultValue="assistants">
        <TabsList>
          <TabsTrigger value="assistants">Assistants</TabsTrigger>
          <TabsTrigger value="threads">Threads</TabsTrigger>
        </TabsList>

        <TabsContent value="assistants">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Create Assistant</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Assistant Name"
                  value={newAssistant.name}
                  onChange={(e) => setNewAssistant({ ...newAssistant, name: e.target.value })}
                />
                <Textarea
                  placeholder="Instructions"
                  value={newAssistant.instructions}
                  onChange={(e) => setNewAssistant({ ...newAssistant, instructions: e.target.value })}
                />
                <Input
                  placeholder="Model"
                  value={newAssistant.model}
                  onChange={(e) => setNewAssistant({ ...newAssistant, model: e.target.value })}
                />
                <Button 
                  onClick={createNewAssistant} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Creating...' : 'Create Assistant'}
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Assistants List</h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {assistants?.map(assistant => (
                  <Card 
                    key={assistant.id} 
                    className={`p-4 cursor-pointer hover:bg-gray-100 ${
                      selectedAssistant?.id === assistant.id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setSelectedAssistant(assistant)}
                  >
                    <h3 className="font-medium">{assistant.name}</h3>
                    <p className="text-sm mt-1">{assistant.instructions}</p>
                    <p className="text-sm text-gray-500 mt-1">Model: {assistant.model}</p>
                    <p className="text-xs text-gray-400 mt-1">{assistant.id}</p>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="threads">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Threads List</h2>
                <Button 
                  onClick={createNewThread} 
                  disabled={loading || !selectedAssistant}
                  size="sm"
                >
                  New Thread
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {threads?.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No threads yet</p>
                ) : (
                  threads?.map(thread => (
                    <Card 
                      key={thread.id} 
                      className={`p-4 cursor-pointer hover:bg-gray-100 ${
                        selectedThread?.id === thread.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div 
                          className="flex-1"
                          onClick={() => handleThreadSelect(thread)}
                        >
                          <p className="text-sm font-medium">
                            Thread {thread.id.slice(-4)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(thread.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteThread(thread.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Thread Messages</h2>
              {selectedThread ? (
                <div className="space-y-4">
                  <div className="h-[400px] overflow-y-auto space-y-2 mb-4">
                    {selectedThread.messages?.map((message, index) => (
                      <Card 
                        key={message.id} 
                        className={`p-3 ${
                          message.role === 'user' 
                            ? 'bg-blue-50 ml-8' 
                            : 'bg-gray-50 mr-8'
                        }`}
                      >
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
                        </p>
                        <p className="text-sm">{message.content[0].text.value}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={loading || !input.trim()}
                    >
                      {loading ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  Select a thread to view messages
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from '@/components/ui/resizable';
import { GripVertical } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ChatInterface } from './ChatInterface';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { useToast } from '@/components/ui/use-toast';

export function OpenCanvas() {
  const { toast } = useToast();
  const store = useStore();

  // State declarations
  const [content, setContent] = useState('// Start coding here');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [status, setStatus] = useState('idle');
  const [currentToolCall, setCurrentToolCall] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(
    import.meta.env.VITE_OPENAI_THREAD_ID
  );
  const [assistantId, setAssistantId] = useState(
    import.meta.env.VITE_OPENAI_ASSISTANT_ID
  );

  // Layout state
  const [sizes, setSizes] = useState([50, 50]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef(null);

  // Debug messages state
  useEffect(() => {
    console.log('Current Messages:', messages)
  }, [messages])

  const handleResize = useCallback(newSizes => {
    if (Array.isArray(newSizes) && newSizes.length === 2) {
      setSizes(newSizes);
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const handleEditorChange = useCallback(value => {
    setContent(value);
  }, []);

  const handleFileUpload = useCallback(
    async file => {
      if (!file) return null;

      try {
        const response = await UnifiedOpenAIService.files.upload(
          file,
          'assistants'
        );

        setUploadedFiles(prev => [
          ...prev,
          {
            id: response.id,
            name: file.name,
            type: file.type,
            size: file.size,
          },
        ]);

        await UnifiedOpenAIService.assistants.files.attach(
          assistantId,
          response.id
        );

        toast({
          title: 'File uploaded successfully',
          description: `${file.name} has been uploaded and attached to the assistant`,
        });

        return response;
      } catch (error) {
        console.error('File upload error:', error);
        toast({
          title: 'Upload failed',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }
    },
    [assistantId, toast]
  );

  const handleSend = async (messageContent, files = []) => {
    if ((!messageContent || !messageContent.trim()) && !files.length) return;

    setIsLoading(true);
    setStatus('in_progress');

    try {
      // Create user message with proper structure
      const userMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userMessage = {
        id: userMessageId,
        role: 'user',
        content: messageContent,
        file_ids: files.map(f => f.id),
        created_at: new Date().toISOString(),
      };

      // Add user message to UI
      setMessages(prev => [...(prev || []), userMessage]);

      // Create assistant message placeholder
      const assistantMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const assistantMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
        isStreaming: true,
      };

      // Add assistant message placeholder
      setMessages(prev => [...(prev || []), assistantMessage]);

      // Scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

      // Send to API
      await UnifiedOpenAIService.threads.messages.create(threadId, {
        role: 'user',
        content: messageContent,
        file_ids: files.map(f => f.id),
      });

      // Create run with streaming
      const runStream = await UnifiedOpenAIService.threads.runs.create(threadId, {
        assistantId,
        stream: true,
      });

      let accumulatedContent = '';

      for await (const event of runStream) {
        setStatus(event.data.status);
        
        switch (event.data.object) {
          case 'thread.message':
          case 'thread.message.delta': {
            const newContent = event.data.content?.[0]?.text?.value || 
                             event.data.delta?.content?.[0]?.text?.value || '';
            
            if (newContent) {
              accumulatedContent += newContent;
              
              // Update the streaming message
              setMessages(prev => (prev || []).map(msg => 
                msg.id === assistantMessageId
                  ? { ...msg, content: accumulatedContent }
                  : msg
              ));

              // Scroll to bottom
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
            break;
          }
          case 'thread.run.completed': {
            // Finalize the assistant message
            setMessages(prev => (prev || []).map(msg => 
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false }
                : msg
            ));
            break;
          }
        }
      }

      setStatus('completed');
    } catch (error) {
      console.error('Message handling error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setCurrentToolCall(null);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Initialize
  useEffect(() => {
    const initializeClient = async () => {
      try {
        if (!assistantId) {
          const assistant = await UnifiedOpenAIService.assistants.create({
            name: 'OpenCanvas Assistant',
            instructions:
              'You are a helpful AI assistant that can use various tools and functions to assist users.',
            tools: ['code_interpreter', 'retrieval', 'function'],
            model: 'gpt-4-turbo-preview',
          });
          store.setAssistantId(assistant.id);
          setAssistantId(assistant.id);
        }

        if (!threadId) {
          const thread = await UnifiedOpenAIService.threads.create();
          setThreadId(thread.id);
        }

        // Load messages with truly unique IDs
        if (threadId) {
          const response = await UnifiedOpenAIService.threads.messages.list(threadId);
          const messagesWithUniqueKeys = response.data.map(msg => ({
            ...msg,
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date(msg.created_at).toISOString(),
          }));
          setMessages(messagesWithUniqueKeys);
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
        toast({
          title: 'Initialization Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    };

    initializeClient();
  }, [assistantId, threadId, store, toast]);

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={handleResize}
        className="h-full w-full rounded-lg border"
      >
        <ResizablePanel
          defaultSize={50}
          minSize={30}
          maxSize={70}
          collapsible
          collapsedSize={0}
          onCollapse={toggleCollapse}
          className="flex flex-col min-h-full"
        >
          <ChatInterface
            messages={messages}
            systemPrompt={systemPrompt}
            onSystemPromptChange={setSystemPrompt}
            onSendMessage={handleSend}
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            status={status}
            currentToolCall={currentToolCall}
            uploadedFiles={uploadedFiles}
            messagesEndRef={messagesEndRef}
          />
        </ResizablePanel>

        <ResizableHandle withHandle>
          <div className="h-full w-2 cursor-col-resize bg-border hover:bg-primary/20 transition-colors flex items-center justify-center">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </ResizableHandle>

        <ResizablePanel
          defaultSize={50}
          minSize={30}
          maxSize={70}
          collapsible
          collapsedSize={0}
          className="flex flex-col min-h-full"
        >
          <div className="flex-1 h-full relative p-1">
            <MonacoEditor
              value={content}
              onChange={handleEditorChange}
              theme={store.theme === 'dark' ? 'custom-dark' : 'custom-light'}
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
              }}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default OpenCanvas;

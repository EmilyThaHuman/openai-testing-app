import { useState, useCallback, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ui/use-toast';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';

export const useMessages = () => {
  const { toast } = useToast();
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const threadId = import.meta.env.VITE_OPENAI_THREAD_ID;
  const assistantId = import.meta.env.VITE_OPENAI_ASSISTANT_ID;
  const [status, setStatus] = useState('idle');
  const messagesEndRef = useRef(null);
  const [currentToolCall, setCurrentToolCall] = useState(null);
  const [messages, setMessages] = useState([]);

  // Get store state and actions
  const {
    // messages,
    isInitialized,
    selectedThread,
    selectedAssistant,
    // setMessages,
    setSelectedThread,
    setSelectedAssistant,
  } = useStore(state => ({
    // messages: state.messages,
    isInitialized: state.isInitialized,
    selectedThread: state.selectedThread,
    selectedAssistant: state.selectedAssistant,
    // setMessages: state.setMessages,
    setSelectedThread: state.setSelectedThread,
    setSelectedAssistant: state.setSelectedAssistant,
  }));

  // Helper to load message history
  const loadMessageHistory = useCallback(
    async threadId => {
      if (!threadId) return;

      try {
        console.log('Loading messages for thread:', threadId);
        const response =
          await UnifiedOpenAIService.threads.messages.list(threadId);

        if (!response?.data) {
          throw new Error('No messages returned from API');
        }

        // Process messages to ensure consistent format
        const processedMessages = response.data.map(msg => ({
          ...msg,
          id: msg.id || `msg_${Date.now()}_${Math.random()}`,
          created_at: new Date(msg.created_at).toISOString(),
          content: Array.isArray(msg.content)
            ? msg.content.map(c => c.text?.value || c).join('\n')
            : msg.content,
          metadata: {
            ...msg.metadata,
            model: msg.metadata?.model || 'gpt-4',
          },
        }));

        console.log('Processed messages:', processedMessages);
        setMessages(processedMessages);
        setStatus('completed');
      } catch (error) {
        console.error('Failed to load message history:', error);
        toast({
          title: 'Error',
          description: 'Failed to load message history',
          variant: 'destructive',
        });
        setStatus('failed');
      }
    },
    [setMessages, toast]
  );

  // Initialize thread and load messages
  useEffect(() => {
    const initializeChat = async () => {
      if (!isInitialized || !threadId || !assistantId) return;

      setIsInitializing(true);
      setStatus('pending');

      try {
        // Retrieve thread
        const thread = await UnifiedOpenAIService.threads.retrieve(threadId);
        console.log('Retrieved thread:', thread);

        if (!thread?.id) {
          throw new Error('Failed to retrieve thread');
        }

        setSelectedThread(thread);
        setMessages(thread.messages);

        // Retrieve assistant
        const assistant =
          await UnifiedOpenAIService.assistants.get(assistantId);
        console.log('Retrieved assistant:', assistant);

        if (!assistant?.id) {
          throw new Error('Failed to retrieve assistant');
        }

        setSelectedAssistant(assistant);

        // Load messages
        await loadMessageHistory(thread.id);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        toast({
          title: 'Error',
          description:
            'Failed to initialize chat. Please try refreshing the page.',
          variant: 'destructive',
        });
        setStatus('failed');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [
    isInitialized,
    threadId,
    assistantId,
    setSelectedThread,
    setSelectedAssistant,
    loadMessageHistory,
    toast,
  ]);

  const handleSendMessage = useCallback(
    async (content, uploadedFileIds = []) => {
      if (!content?.trim() && uploadedFileIds.length === 0) return;
      if (isInitializing) return;
      setStatus('in_progress');

      try {
        if (!isInitialized) {
          throw new Error('OpenAI is not initialized. Please check your API key.');
        }

        if (!threadId || !assistantId) {
          throw new Error('Thread ID or Assistant ID not found');
        }

        // Double check thread exists
        const thread = await UnifiedOpenAIService.threads.retrieve(threadId);
        if (!thread?.id) {
          throw new Error('Thread not found or invalid');
        }

        // Set streaming state
        setIsStreaming(true);
        setStreamingContent('');

        // Create user message
        const userMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const userMessage = {
          id: userMessageId,
          role: 'user',
          content: content,
          file_ids: uploadedFileIds,
          created_at: new Date().toISOString(),
        };

        // Add user message to UI
        setMessages(prev => [...(prev || []), userMessage]);

        // Create message in thread
        await UnifiedOpenAIService.threads.messages.create(threadId, {
          content,
          uploadedFileIds,
        });

        // Start run with streaming
        const runStream = await UnifiedOpenAIService.threads.runs.create(threadId, {
          assistantId,
          stream: true,
        });

        // Handle streaming response
        let accumulatedContent = '';
        const streamingMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Add initial streaming message
        setMessages(prev => [
          ...(prev || []),
          {
            id: streamingMessageId,
            role: 'assistant',
            content: '',
            created_at: new Date().toISOString(),
            isStreaming: true,
          },
        ]);

        for await (const event of runStream) {
          setStatus(event.data.status);

          switch (event.data.object) {
            case 'thread.message':
            case 'thread.message.delta': {
              const newContent = event.data.content?.[0]?.text?.value || 
                               event.data.delta?.content?.[0]?.text?.value || '';

              if (newContent) {
                accumulatedContent += newContent;
                
                // Update streaming message in the messages array
                setMessages(prev => 
                  prev.map(msg =>
                    msg.id === streamingMessageId
                      ? { ...msg, content: accumulatedContent, isStreaming: true }
                      : msg
                  )
                );

                // Also update streaming content state
                setStreamingContent(accumulatedContent);
              }
              break;
            }
            case 'thread.run.completed': {
              // Finalize the streaming message
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === streamingMessageId
                    ? { 
                        ...msg, 
                        content: accumulatedContent,
                        isStreaming: false,
                        metadata: { model: 'gpt-4' }
                      }
                    : msg
                )
              );
              setStatus('completed');
              break;
            }
          }
        }

      } catch (error) {
        console.error('Failed to send message:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to send message. Please try again.',
          variant: 'destructive',
        });
        setStatus('failed');
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
        setCurrentToolCall(null);
      }
    },
    [isInitializing, isInitialized, threadId, assistantId, toast]
  );

  // Helper to clear messages
  const clearMessages = useCallback(() => {
    if (setMessages) {
      setMessages([]);
    }
    setStreamingContent('');
    setIsStreaming(false);
  }, [setMessages]);

  return {
    messages,
    streamingContent,
    isStreaming,
    isInitializing,
    handleSendMessage,
    clearMessages,
    loadMessageHistory,
    status,
    threadId,
    assistantId,
    currentToolCall,
  };
};

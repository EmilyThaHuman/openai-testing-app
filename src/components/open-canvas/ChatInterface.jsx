import { memo, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { MessageInput } from '@/components/chat/MessageInput'
import { SystemInstructions } from '@/components/chat/SystemInstructions'
import { useStore } from '@/store/useStore'
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export const ChatInterface = memo(function ChatInterface() {
  // Get state from store
  const {
    messages,
    systemPrompt,
    isLoading,
    status,
    currentToolCall,
    uploadedFiles,
    sendMessage,
    setSystemPrompt,
    handleFileUpload,
    apiKey,
    isInitialized,
    initialize
  } = useStore(state => ({
    messages: state.messages || [],
    systemPrompt: state.systemPrompt,
    isLoading: state.isLoading,
    status: state.status || 'idle',
    currentToolCall: state.currentToolCall,
    uploadedFiles: state.uploadedFiles || [],
    sendMessage: state.sendMessage,
    setSystemPrompt: state.setSystemPrompt,
    handleFileUpload: state.handleFileUpload,
    apiKey: state.apiKey,
    isInitialized: state.isInitialized,
    initialize: state.initialize
  }))

  const { toast } = useToast()

  // Refs
  const messagesEndRef = useRef(null)

  // Initialize OpenAI if needed
  useEffect(() => {
    if (apiKey && !isInitialized) {
      try {
        UnifiedOpenAIService.initialize(apiKey)
        initialize(apiKey)
      } catch (error) {
        console.error('Failed to initialize OpenAI:', error)
        toast({
          title: 'Error',
          description: 'Failed to initialize OpenAI. Please check your API key.',
          variant: 'destructive'
        })
      }
    }
  }, [apiKey, isInitialized, initialize, toast])

  // Sort messages by creation time
  const sortedMessages = useMemo(() => {
    if (!Array.isArray(messages)) return []
    
    return [...messages].sort((a, b) => {
      if (!a || !b) return 0
      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()
      return dateA - dateB
    })
  }, [messages])

  // Auto scroll on new messages
  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sortedMessages])

  // Handlers
  const handleSendMessage = useCallback(async (content) => {
    if (!content?.trim()) return
    if (!apiKey || !isInitialized) {
      toast({
        title: 'Error',
        description: 'OpenAI not initialized. Please check your API key in settings.',
        variant: 'destructive'
      })
      return
    }

    try {
      await sendMessage?.(content)
    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      })
    }
  }, [sendMessage, apiKey, isInitialized, toast])

  const handleSystemPromptChange = useCallback((value) => {
    setSystemPrompt?.(value)
  }, [setSystemPrompt])

  return (
    <div className="flex flex-col h-full relative bg-background">
      <SystemInstructions
        value={systemPrompt}
        onChange={handleSystemPromptChange}
        aria-label="System Instructions"
        className="sticky top-0 z-30"
      />

      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full absolute inset-0">
          <div className="flex flex-col p-4 gap-4 min-h-full">
            <AnimatePresence mode="popLayout" initial={false}>
              {sortedMessages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-muted-foreground py-12"
                >
                  Start a conversation...
                </motion.div>
              ) : (
                sortedMessages.map((message) => (
                  <motion.div
                    key={`${message.id}-${message.created_at}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <ChatMessage
                      message={message}
                      status={status}
                      currentToolCall={currentToolCall}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-border p-4 bg-background/95 backdrop-blur sticky bottom-0 z-30">
        <MessageInput
          onSend={handleSendMessage}
          onFileClick={handleFileUpload}
          disabled={isLoading}
          placeholder="Send a message or upload files..."
          uploadedFiles={uploadedFiles}
          aria-label="Chat input"
        />
      </div>
    </div>
  )
})

ChatInterface.displayName = 'ChatInterface'

export default ChatInterface 
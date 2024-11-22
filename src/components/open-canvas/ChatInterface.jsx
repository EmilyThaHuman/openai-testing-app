import React, { memo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { CanvasChatInput } from './CanvasChatInput'
import { SystemInstructions } from '@/components/chat/SystemInstructions'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMessages } from '@/hooks/useMessages'
import { cn } from '@/lib/utils'

export const ChatInterface = memo(({ className }) => {
  const scrollRef = useRef(null)

  const {
    messages,
    streamingContent,
    isStreaming,
    isInitializing,
    handleSendMessage,
    status,
    threadId,
    assistantId,
    currentToolCall
  } = useMessages()

  // Auto-scroll effect
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current
      setTimeout(() => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        })
      }, 100)
    }
  }, [messages, streamingContent, status])

  // Status display component
  const StatusDisplay = ({ status }) => {
    if (!status) return null
    
    const statusMessages = {
      pending: 'Initializing chat...',
      in_progress: 'Assistant is thinking...',
      completed: 'Ready for your message',
      failed: 'Something went wrong. Please try again.',
      queued: 'Request queued...',
      requires_action: 'Waiting for action...',
      expired: 'Session expired. Please refresh.',
      cancelling: 'Cancelling...',
      cancelled: 'Cancelled',
    }

    return (
      <Alert 
        variant={status === 'failed' ? 'destructive' : 'default'}
        className="mb-2"
      >
        <AlertDescription className="flex items-center gap-2">
          {(status === 'in_progress' || status === 'pending') && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {statusMessages[status] || status}
        </AlertDescription>
      </Alert>
    )
  }

  // Process message for display
  const processMessage = message => {
    if (!message) return null

    let processedContent = ''
    
    if (typeof message.content === 'string') {
      processedContent = message.content
    } else if (Array.isArray(message.content)) {
      processedContent = message.content
        .map(content => {
          if (typeof content === 'string') return content
          if (content.text?.value) return content.text.value
          if (typeof content.content === 'string') return content.content
          return ''
        })
        .filter(Boolean)
        .join('\n')
    } else if (message.content?.text?.value) {
      processedContent = message.content.text.value
    }

    return {
      id: message.id || `msg_${Date.now()}_${Math.random()}`,
      role: message.role || 'user',
      content: processedContent,
      created_at: message.created_at || new Date().toISOString(),
      isStreaming: message.isStreaming || false,
      metadata: {
        ...message.metadata,
        model: message.metadata?.model || 'gpt-4'
      },
      file_ids: message.file_ids || []
    }
  }

  return (
    <div className={cn(
      'flex flex-col h-full',
      'bg-background',
      className
    )}>
      {/* Status Bar */}
      <div className="flex-none p-2 border-b bg-background/95 backdrop-blur sticky top-0 z-30">
        <StatusDisplay status={status} />
      </div>

      {/* System Instructions */}
      <div className="flex-none px-4 pt-4 bg-background/95 backdrop-blur sticky top-12 z-20">
        <SystemInstructions />
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea 
          ref={scrollRef}
          className="h-[calc(100vh-15rem)] w-full"
          style={{ paddingBottom: '100px' }}
        >
          <div className="p-4 space-y-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {/* Message List */}
              {Array.isArray(messages) && messages.map((message, index) => {
                const processedMessage = processMessage(message)
                if (!processedMessage) return null

                return (
                  <motion.div
                    key={processedMessage.id || `${processedMessage.role}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChatMessage 
                      message={processedMessage}
                      status={processedMessage.isStreaming ? 'in_progress' : status}
                    />
                  </motion.div>
                )
              })}

              {/* Tool Call Display */}
              {currentToolCall && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChatMessage
                    message={{
                      id: 'tool-call',
                      role: 'system',
                      content: `Running tool: ${currentToolCall.type}`,
                      created_at: new Date().toISOString(),
                      metadata: { toolCall: currentToolCall }
                    }}
                    status="in_progress"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="flex-none mt-auto border-t bg-background/95 backdrop-blur z-30">
        <div className="p-4 max-w-[100vw]">
          <CanvasChatInput
            onSend={handleSendMessage}
            disabled={isInitializing || !threadId || !assistantId}
            isStreaming={isStreaming}
            status={status}
          />
        </div>
      </div>
    </div>
  )
})

ChatInterface.displayName = 'ChatInterface'

export default ChatInterface

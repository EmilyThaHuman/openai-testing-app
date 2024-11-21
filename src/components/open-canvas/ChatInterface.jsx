import { memo, useMemo, useEffect } from 'react'
import { m as motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { SystemInstructions } from '@/components/chat/SystemInstructions'
import { cn } from '@/lib/utils'

const MotionDiv = motion.div

export const ChatInterface = memo(function ChatInterface({
  messages = [],
  systemPrompt = '',
  onSystemPromptChange,
  onSendMessage,
  onFileUpload,
  isLoading = false,
  status = 'idle',
  currentToolCall = null,
  uploadedFiles = [],
  messagesEndRef
}) {
  // Debug messages
  useEffect(() => {
    console.log('Messages updated:', messages)
  }, [messages])

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
  }, [sortedMessages, messagesEndRef])

  return (
    <div className="flex flex-col h-full relative bg-background">
      <SystemInstructions
        value={systemPrompt}
        onChange={onSystemPromptChange}
        aria-label="System Instructions"
        className="sticky top-0 z-30"
      />

      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full absolute inset-0">
          <div className="flex flex-col p-4 gap-4 min-h-full">
            <AnimatePresence mode="popLayout" initial={false}>
              {sortedMessages.length === 0 ? (
                <MotionDiv
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-muted-foreground py-12"
                >
                  Start a conversation...
                </MotionDiv>
              ) : (
                sortedMessages.map((message) => (
                  <MotionDiv
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
                  </MotionDiv>
                ))
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-border p-4 bg-background/95 backdrop-blur sticky bottom-0 z-30">
        <ChatInput
          onSend={onSendMessage}
          onFileUpload={onFileUpload}
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
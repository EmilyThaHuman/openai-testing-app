import React, { useRef, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './ChatMessage'
import { MessageInput } from './MessageInput'
import { useInView } from 'react-intersection-observer'
import { motion, AnimatePresence } from 'framer-motion'

export function ChatDialog({ open = false, onOpenChange = () => {}, assistant }) {
  const scrollRef = useRef(null)
  const { ref: bottomRef, inView } = useInView()
  
  const {
    messages,
    isLoading,
    error,
    isStreaming,
    streamingContent,
    sendMessage,
    regenerateResponse,
    submitFeedback,
    updateAssistant,
    clearMessages
  } = useStore(state => ({
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    isStreaming: state.isStreaming,
    streamingContent: state.streamingContent,
    sendMessage: state.sendMessage,
    regenerateResponse: state.regenerateResponse,
    submitFeedback: state.submitFeedback,
    updateAssistant: state.updateAssistant,
    clearMessages: state.clearMessages
  }))

  const handleSendMessage = useCallback(async (content, files = []) => {
    try {
      await sendMessage(content, files, {
        assistantId: assistant?.id,
        shouldStream: true
      })
      scrollToBottom()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [assistant?.id, sendMessage])

  const handleRegenerate = useCallback(async (messageId) => {
    try {
      await regenerateResponse(messageId)
      scrollToBottom()
    } catch (error) {
      console.error('Failed to regenerate response:', error)
    }
  }, [regenerateResponse])

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col gap-0 p-0">
        <ScrollArea className="flex-1 p-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4"
              >
                <ChatMessage
                  message={message}
                  onRegenerate={handleRegenerate}
                  onFeedback={submitFeedback}
                />
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </AnimatePresence>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <MessageInput
            onSend={handleSendMessage}
            disabled={isLoading || isStreaming}
            placeholder="Type a message..."
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default React.memo(ChatDialog)

import React, { useState, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Paperclip, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from '@/components/ui/use-toast'

export function MessageInput({
  onSend,
  onFileClick,
  disabled = false,
  placeholder = "Type your message...",
}) {
  const [messageInput, setMessageInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    isUploading,
    uploadedFiles,
    apiKey,
    isInitialized
  } = useStore(state => ({
    isUploading: state.isUploading,
    uploadedFiles: state.uploadedFiles || [],
    apiKey: state.apiKey,
    isInitialized: state.isInitialized
  }))

  const { toast } = useToast()

  const hasContent = messageInput?.trim()?.length > 0 || uploadedFiles?.length > 0

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault()
    if (!hasContent || disabled || isUploading || isSubmitting) return

    if (!apiKey || !isInitialized) {
      toast({
        title: 'Error',
        description: 'OpenAI not initialized. Please check your API key in settings.',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onSend?.(messageInput)
      setMessageInput('') // Clear input after sending
    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [messageInput, hasContent, disabled, isUploading, isSubmitting, apiKey, isInitialized, onSend, toast])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const handleChange = useCallback((e) => {
    setMessageInput(e.target.value)
  }, [])

  return (
    <div className="relative flex-1">
      <Textarea
        value={messageInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "min-h-[20px] max-h-[200px] pr-20",
          "resize-none overflow-hidden",
          "focus:ring-1 focus:ring-primary",
          "rounded-md",
          "text-sm",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={disabled || isUploading || isSubmitting}
      />
      <div className="absolute right-2 bottom-2 flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onFileClick}
          disabled={disabled || isUploading || isSubmitting}
          title="Attach files"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <Button
          type="submit"
          size="icon"
          className={cn(
            "h-8 w-8",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90",
            "disabled:opacity-50"
          )}
          disabled={disabled || isUploading || isSubmitting || !hasContent}
          title="Send message"
          onClick={handleSubmit}
        >
          {isSubmitting || isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

export default React.memo(MessageInput)
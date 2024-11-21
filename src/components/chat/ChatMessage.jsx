import { memo } from 'react'
import { m as motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { markdownComponents } from './MarkdownComponents'
import { cn } from '@/lib/utils'
import { useStoreSelector } from '@/store/useStore';

const MotionDiv = motion.div

const MarkdownContent = memo(({ content }) => (
  <div className="prose prose-sm dark:prose-invert max-w-none break-words">
    <ReactMarkdown
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  </div>
))

MarkdownContent.displayName = 'MarkdownContent'

export const ChatMessage = memo(({ message, status }) => {
  const { currentToolCall } = useStoreSelector(state => ({
    currentToolCall: state.currentToolCall
  }));

  const isAssistant = message.role === 'assistant'
  const isStreaming = message.isStreaming || status === 'in_progress'

  // Debug message content
  console.log('Message content:', message.content)

  const getMessageContent = () => {
    if (typeof message.content === 'string') {
      return message.content
    }
    
    if (Array.isArray(message.content)) {
      return message.content
        .map(c => {
          if (typeof c === 'string') return c
          if (c.text?.value) return c.text.value
          if (c.content) return c.content
          return ''
        })
        .join('\n')
    }

    if (message.content?.text?.value) {
      return message.content.text.value
    }

    return ''
  }

  const messageContent = getMessageContent()
  
  // Debug processed content
  console.log('Processed content:', messageContent)

  return (
    <div className="w-full py-2 relative z-10">
      <div className={cn(
        "flex flex-col max-w-3xl mx-auto",
        isAssistant ? "items-start" : "items-end"
      )}>
        <div className={cn(
          "flex flex-col gap-2 px-4 py-3 rounded-lg max-w-[90%] relative",
          "shadow-sm border border-border/50",
          isAssistant ? "bg-secondary/30" : "bg-primary/10",
          isStreaming && "animate-pulse"
        )}>
          <div className="flex items-center gap-2">
            <Badge
              variant={isAssistant ? 'secondary' : 'default'}
              className="capitalize z-20"
            >
              {message.role}
            </Badge>
            {isStreaming && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>

          <div className={cn(
            "relative z-10",
            isStreaming && "opacity-90"
          )}>
            {messageContent ? (
              <MarkdownContent content={messageContent} />
            ) : (
              <div className="text-muted-foreground italic">Empty message</div>
            )}
          </div>

          {message.metadata?.model && (
            <div className="mt-1 text-xs text-muted-foreground">
              Model: {message.metadata.model}
            </div>
          )}

          {isAssistant && currentToolCall && (
            <div className="mt-2 p-2 bg-muted rounded-md">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(currentToolCall, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

ChatMessage.displayName = 'ChatMessage'

export default ChatMessage

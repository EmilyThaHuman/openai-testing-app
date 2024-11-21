import { memo, useEffect } from 'react';
import { m as motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from './MarkdownComponents';
import { cn } from '@/lib/utils';
import { useStoreSelector } from '@/store/useStore';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const ToolOutput = memo(function ToolOutput({ output }) {
  if (!output) return null;

  // Handle different output types
  if (output.type === 'image') {
    return (
      <img
        src={output.url}
        alt={output.description}
        className="max-w-full rounded-md"
      />
    );
  }

  if (output.type === 'data') {
    return (
      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
        <code>{JSON.stringify(output.data, null, 2)}</code>
      </pre>
    );
  }

  if (output.type === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{output.message}</AlertDescription>
      </Alert>
    );
  }

  // Default text output
  return <p className="whitespace-pre-wrap">{output.text}</p>;
});

const MarkdownContent = memo(({ content }) => {
  if (!content) {
    console.warn('MarkdownContent received empty content');
    return null;
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
});

MarkdownContent.displayName = 'MarkdownContent';

export const ChatMessage = memo(({ message, status }) => {
  const { currentToolCall } = useStoreSelector(state => ({
    currentToolCall: state.currentToolCall,
  }));

  if (!message) {
    console.warn('No message provided to ChatMessage component');
    return null;
  }

  const isAssistant = message.role === 'assistant';
  const isStreaming = message.isStreaming || status === 'in_progress';

  const getMessageContent = () => {
    if (typeof message.content === 'string') {
      return message.content;
    }

    if (Array.isArray(message.content)) {
      return message.content
        .map(c => {
          if (typeof c === 'string') return c;
          if (c.text?.value) return c.text.value;
          if (c.content) return c.content;
          return '';
        })
        .filter(Boolean)
        .join('\n');
    }

    if (message.content?.text?.value) {
      return message.content.text.value;
    }

    return '';
  };

  const messageContent = getMessageContent();

  return (
    <div className={cn(
      'w-full py-2',
      'bg-background',
      isStreaming && 'animate-pulse'
    )}>
      <div className={cn(
        'max-w-4xl mx-auto',
        'flex',
        isAssistant ? 'justify-start' : 'justify-end'
      )}>
        <div className={cn(
          'flex flex-col gap-2',
          'px-4 py-3 rounded-lg',
          'border border-border',
          'shadow-sm',
          'max-w-[90%]',
          isAssistant ? 'bg-muted/50' : 'bg-primary/5',
        )}>
          {/* Role Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant={isAssistant ? 'secondary' : 'default'}
              className="capitalize"
            >
              {message.role}
            </Badge>
            {isStreaming && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>

          {/* Message Content */}
          <div className={cn(
            'min-h-[1.5rem]',
            'text-foreground',
            isStreaming && 'opacity-90'
          )}>
            {messageContent ? (
              <MarkdownContent content={messageContent} />
            ) : (
              <div className="text-muted-foreground italic">Empty message</div>
            )}
          </div>

          {/* Metadata */}
          {message.metadata?.model && (
            <div className="mt-1 text-xs text-muted-foreground">
              Model: {message.metadata.model}
            </div>
          )}

          {/* Tool Call Display */}
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
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import FilePreview from './FilePreview';
import { markdownComponents } from './MarkdownComponents';

export const ChatMessage = memo(({ message, isUser, files }) => {
  return (
    <Card
      className={cn(
        'p-4 rounded-lg',
        isUser ? 'ml-8 bg-accent' : 'mr-8 bg-muted'
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-medium text-muted-foreground">
          {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={markdownComponents}
        >
          {message.content}
        </ReactMarkdown>
      </div>
      
      {files?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <FilePreview key={index} file={file} />
          ))}
        </div>
      )}
    </Card>
  );
});

ChatMessage.displayName = 'ChatMessage'; 
import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { FileText, Image as ImageIcon, File, Download, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const CodeBlock = memo(({ language, value }) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      duration: 1000
    });
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="absolute left-2 top-2 text-xs text-muted-foreground opacity-50">
        {language}
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          padding: '2rem 1rem 1rem 1rem',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

const FilePreview = memo(({ file }) => {
  const getFileIcon = (file) => {
    if (file.type?.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (file.type?.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center gap-1 bg-background p-2 rounded-md text-sm group">
      {getFileIcon(file)}
      <span className="max-w-[100px] truncate">{file.filename}</span>
      {file.url && (
        <a
          href={file.url}
          download
          className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download className="w-4 h-4" />
        </a>
      )}
    </div>
  );
});

FilePreview.displayName = 'FilePreview';

export const ChatMessage = memo(({ message, isUser, files }) => {
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (!inline && match) {
        return (
          <CodeBlock
            language={language}
            value={String(children).replace(/\n$/, '')}
            {...props}
          />
        );
      }

      return (
        <code className={cn(
          "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
          className
        )} {...props}>
          {children}
        </code>
      );
    },
    p({ children }) {
      return <p className="mb-4 last:mb-0">{children}</p>;
    },
    a({ children, href }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {children}
        </a>
      );
    },
    ul({ children }) {
      return <ul className="list-disc pl-4 mb-4 last:mb-0">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal pl-4 mb-4 last:mb-0">{children}</ol>;
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-2 border-muted-foreground pl-4 italic mb-4 last:mb-0">
          {children}
        </blockquote>
      );
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto mb-4 last:mb-0">
          <table className="w-full border-collapse">
            {children}
          </table>
        </div>
      );
    },
    th({ children }) {
      return (
        <th className="border border-muted-foreground px-4 py-2 text-left">
          {children}
        </th>
      );
    },
    td({ children }) {
      return (
        <td className="border border-muted-foreground px-4 py-2">
          {children}
        </td>
      );
    },
  };

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
          components={components}
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
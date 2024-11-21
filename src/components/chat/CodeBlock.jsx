import { memo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Download } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const COPY_TIMEOUT = 1000;

export const CodeBlock = memo(({ language, value }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        duration: COPY_TIMEOUT
      });
      setTimeout(() => setCopied(false), COPY_TIMEOUT);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [value, toast]);

  const handleDownload = useCallback(() => {
    try {
      const blob = new Blob([value], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code.${language || 'txt'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "File downloaded",
        duration: 1000
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [value, language, toast]);

  return (
    <div className="relative group rounded-lg overflow-hidden">
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={cn(
            "h-8 w-8 p-0",
            copied && "text-green-500"
          )}
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="h-8 w-8 p-0"
          aria-label="Download code"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
      
      {language && (
        <div className="absolute left-2 top-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          {language}
        </div>
      )}

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          padding: '2rem 1rem 1rem 1rem',
          backgroundColor: 'var(--code-bg)',
        }}
        PreTag="div"
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock; 
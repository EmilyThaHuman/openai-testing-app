import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  MoreVertical, 
  MessageSquare, 
  Repeat,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

export const MessageToolbar = memo(({ 
  message, 
  onRegenerate, 
  onFeedback,
  isAssistant 
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        description: "Message copied to clipboard",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy message",
      });
    }
  };

  return (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleCopy}
      >
        <Copy className="h-4 w-4" />
        <span className="sr-only">Copy message</span>
      </Button>
      
      {isAssistant && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onRegenerate?.(message)}
          >
            <Repeat className="h-4 w-4" />
            <span className="sr-only">Regenerate response</span>
          </Button>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onFeedback?.(message, 'positive')}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="sr-only">Positive feedback</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onFeedback?.(message, 'negative')}
            >
              <ThumbsDown className="h-4 w-4" />
              <span className="sr-only">Negative feedback</span>
            </Button>
          </div>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onRegenerate?.(message)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Quote
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

MessageToolbar.displayName = 'MessageToolbar'; 
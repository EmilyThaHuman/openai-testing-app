import React, { memo, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export const CanvasMessageInput = memo(({
  onSend,
  onFileClick,
  onPaste,
  onKeyDown,
  onChange,
  value,
  disabled = false,
  isUploading = false,
  isStreaming = false,
  placeholder = 'Type your message...',
  hasContent = false
}) => {
  const { toast } = useToast();
  
  // Get required store state
  const { isInitialized, apiKey, selectedAssistant, selectedThread } = useStore(state => ({
    isInitialized: state.isInitialized,
    apiKey: state.apiKey,
    selectedAssistant: state.selectedAssistant,
    selectedThread: state.selectedThread
  }));

  const handleSubmit = useCallback(async e => {
    e?.preventDefault();
    
    // Validate requirements
    if (!hasContent || disabled || isUploading || isStreaming) return;
    
    if (!apiKey || !isInitialized) {
      toast({
        title: 'Error',
        description: 'OpenAI not initialized. Please check your API key in settings.',
        variant: 'destructive'
      });
      return;
    }

    // if (!selectedThread?.id) {
    //   toast({
    //     title: 'Error', 
    //     description: 'No active chat thread. Please try refreshing the page.',
    //     variant: 'destructive'
    //   });
    //   return;
    // }

    // if (!selectedAssistant?.id) {
    //   toast({
    //     title: 'Error',
    //     description: 'No assistant selected. Please try refreshing the page.',
    //     variant: 'destructive'
    //   });
    //   return;
    // }

    try {
      await onSend?.(value);
      onChange?.({ target: { value: '' } });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      });
    }
  }, [
    hasContent,
    disabled,
    isUploading,
    isStreaming,
    apiKey,
    isInitialized,
    selectedThread,
    selectedAssistant,
    onSend,
    value,
    onChange,
    toast
  ]);

  const handleKeyDown = useCallback(e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    onKeyDown?.(e);
  }, [handleSubmit, onKeyDown]);

  return (
    <div className="relative flex-1">
      <Textarea
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onPaste={onPaste}
        placeholder={placeholder}
        className={cn(
          'min-h-[20px] max-h-[200px] pr-20',
          'resize-none overflow-hidden',
          'focus:ring-1 focus:ring-primary',
          'rounded-md',
          'text-sm',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        disabled={disabled || isUploading || isStreaming}
      />
      
      <div className="absolute right-2 bottom-2 flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onFileClick}
          disabled={disabled || isUploading || isStreaming}
          title="Attach files"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <Button
          type="submit"
          size="icon"
          className={cn(
            'h-8 w-8',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90',
            'disabled:opacity-50'
          )}
          disabled={disabled || isUploading || isStreaming || !hasContent}
          title="Send message"
          onClick={handleSubmit}
        >
          {isUploading || isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
});

CanvasMessageInput.displayName = 'CanvasMessageInput';

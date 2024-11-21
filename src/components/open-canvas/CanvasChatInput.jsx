import React, { memo, useRef, useCallback, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALLOWED_FILE_TYPES } from '@/constants/fileConstants';
import { useFileHandler } from '@/hooks/useFileHandler';
import FilePreview from '../chat/FilePreview';

export const CanvasChatInput = memo(({ onSend, disabled, isStreaming, status }) => {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const fileInputRef = useRef(null);

  // Get store state and actions
  const {
    isInitialized,
    apiKey,
    isUploading,
    uploadFile,
    uploadProgress
  } = useStore(state => ({
    isInitialized: state.isInitialized,
    apiKey: state.apiKey,
    isUploading: state.isUploading,
    uploadFile: state.uploadFile,
    uploadProgress: state.uploadProgress || {}
  }));

  // File handling
  const { files, setFiles, handleFileSelect, removeFile } = useFileHandler();

  const hasContent = input.trim().length > 0 || files.length > 0;

  const handleSubmit = useCallback(async e => {
    e?.preventDefault();
    
    if (!hasContent || disabled || isUploading || isStreaming) return;
    
    if (!apiKey || !isInitialized) {
      toast({
        title: 'Error',
        description: 'OpenAI not initialized. Please check your API key in settings.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Upload files if any
      const uploadedFileIds = await Promise.all(
        files.map(async file => {
          try {
            const response = await uploadFile(file);
            return response?.id;
          } catch (error) {
            console.error('Failed to upload file:', error);
            return null;
          }
        })
      );

      // Send message with file IDs
      await onSend(input, uploadedFileIds.filter(Boolean));

      // Reset state
      setInput('');
      setFiles([]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
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
    files,
    input,
    onSend,
    uploadFile,
    setFiles,
    toast
  ]);

  const handleKeyDown = useCallback(e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handlePaste = useCallback(e => {
    const items = Array.from(e.clipboardData.items)
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile());

    if (items.length > 0) {
      e.preventDefault();
      handleFileSelect(items);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback(e => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2"
      onDrop={e => {
        e.preventDefault();
        handleFileSelect(e.dataTransfer.files);
      }}
      onDragOver={e => e.preventDefault()}
    >
      {/* Status Indicator */}
      {status && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          {isStreaming && <Loader2 className="w-3 h-3 animate-spin" />}
          <span>{status}</span>
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <ScrollArea className="max-h-[100px]">
          <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md">
            {files.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                progress={uploadProgress[file.name]}
                onRemove={() => removeFile(index)}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Message Input */}
      <div className="relative flex items-end gap-2">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={disabled ? 'Initializing...' : 'Type your message...'}
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
        
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8',
              'hover:bg-muted',
              disabled && 'opacity-50'
            )}
            onClick={() => fileInputRef.current?.click()}
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
              'disabled:opacity-50',
              !hasContent && 'opacity-50'
            )}
            disabled={disabled || isUploading || isStreaming || !hasContent}
            title="Send message"
          >
            {isUploading || isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileInput}
        accept={Object.keys(ALLOWED_FILE_TYPES).join(',')}
      />
    </form>
  );
});

CanvasChatInput.displayName = 'CanvasChatInput';

export default CanvasChatInput;

import React from 'react';
import { useStoreSelector } from '@/store/useStore';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MessageInput({
  onSend,
  onFileClick,
  disabled = false,
  placeholder = "Type your message...",
}) {
  const {
    messageInput,
    setMessageInput,
    isUploading,
    uploadedFiles
  } = useStoreSelector(state => ({
    messageInput: state.messageInput || '',
    setMessageInput: state.setMessageInput,
    isUploading: state.isUploading,
    uploadedFiles: state.uploadedFiles || []
  }));

  const hasContent = messageInput?.trim()?.length > 0 || uploadedFiles?.length > 0;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!hasContent || disabled || isUploading) return;

    try {
      await onSend?.(messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative flex-1">
      <Textarea
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "min-h-[20px] max-h-[200px] pr-20",
          "resize-none overflow-hidden",
          "focus:ring-1 focus:ring-primary"
        )}
        disabled={disabled || isUploading}
      />
      <div className="absolute right-2 bottom-2 flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onFileClick}
          disabled={disabled || isUploading}
          title="Attach files"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8"
          disabled={disabled || isUploading || !hasContent}
          title="Send message"
          onClick={handleSubmit}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
} 
import React, { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MessageInput({
  input,
  onChange,
  onPaste,
  onKeyDown,
  onSubmit,
  onFileClick,
  disabled,
  isUploading,
  placeholder,
  hasContent,
}) {
  const textareaRef = useRef(null);

  return (
    <div className="relative flex-1">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={onChange}
        onPaste={onPaste}
        onKeyDown={onKeyDown}
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
          onClick={onSubmit}
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
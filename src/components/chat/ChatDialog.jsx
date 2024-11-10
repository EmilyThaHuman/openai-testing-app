import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { formatDate } from "@/lib/utils";

export function ChatDialog({
  open,
  onOpenChange,
  messages = [],
  onSendMessage,
  onFileUpload,
  isLoading,
  assistant,
  error,
}) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const renderAssistantDetails = () => {
    if (!assistant) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{assistant.name}</h2>
          <Badge
            variant={assistant.status === "active" ? "success" : "secondary"}
          >
            {assistant.status}
          </Badge>
        </div>

        <DialogDescription className="text-sm text-muted-foreground">
          {assistant.description || "No description provided"}
        </DialogDescription>

        <div className="flex flex-wrap gap-2">
          {assistant.tools?.map((tool, index) => (
            <Badge key={index} variant="outline">
              {tool.type}
            </Badge>
          ))}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Model: {assistant.model}</p>
          <p>Created: {formatDate(assistant.created_at)}</p>
          {assistant.file_ids?.length > 0 && (
            <p>Files attached: {assistant.file_ids.length}</p>
          )}
        </div>
      </div>
    );
  };

  const formatMessages = (messages) => {
    return messages.map((msg) => ({
      ...msg,
      content: Array.isArray(msg.content)
        ? msg.content
            .map((c) => (typeof c === "string" ? c : c.text))
            .join("\n")
        : typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader className="space-y-4">
          {renderAssistantDetails()}
          <Separator />
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea ref={scrollRef} className="flex-1 pr-4">
            <div className="space-y-4 pb-4">
              {formatMessages(messages).map((message, i) => (
                <ChatMessage
                  key={`${message.id || i}-${message.timestamp}`}
                  message={message}
                  isUser={message.role === "user"}
                  files={message.file_ids?.map((id) => ({
                    id,
                    name: `File ${id}`,
                    type: "unknown",
                  }))}
                  onRegenerate={onRegenerate}
                  onFeedback={onFeedback}
                />
              ))}
              {isLoading && (
                <div className="text-sm text-muted-foreground animate-pulse">
                  Assistant is typing...
                </div>
              )}
              {error && (
                <div className="text-sm text-destructive">
                  Error: {error.message || "Something went wrong"}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="pt-4">
            <ChatInput
              onSend={onSendMessage}
              onFileUpload={onFileUpload}
              disabled={isLoading}
              placeholder={
                isLoading
                  ? "Assistant is thinking..."
                  : `Message ${assistant?.name || "Assistant"}...`
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

ChatDialog.displayName = "ChatDialog";

export default { ChatDialog };

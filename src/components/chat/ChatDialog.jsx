import React, { useEffect, useRef, useCallback, useState } from "react";
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
import { ChevronDown, ChevronUp } from "lucide-react";

export function ChatDialog({
  open,
  onOpenChange,
  messages = [],
  onSendMessage,
  onFileUpload,
  isLoading,
  assistant,
  error,
  onRegenerate,
  onFeedback,
}) {
  const scrollRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const [detailsOpen, setDetailsOpen] = useState(true);

  // Check if user is near the bottom
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      isNearBottomRef.current = distanceFromBottom < 100;
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && isNearBottomRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const renderAssistantDetails = useCallback(() => {
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

        {assistant.description && (
          <DialogDescription className="text-sm text-muted-foreground">
            {assistant.description}
          </DialogDescription>
        )}

        {assistant.instructions && (
          <div className="bg-muted/10 p-2 rounded-md">
            <p className="font-semibold mb-1">Instructions:</p>
            <p className="text-sm">{assistant.instructions}</p>
          </div>
        )}

        {assistant.tools?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {assistant.tools.map((tool, index) => (
              <Badge key={index} variant="outline">
                {tool.type}
              </Badge>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          {assistant.model && <p>Model: {assistant.model}</p>}
          {assistant.created_at && (
            <p>Created: {formatDate(assistant.created_at)}</p>
          )}
          {assistant.file_ids?.length > 0 && (
            <p>Files attached: {assistant.file_ids.length}</p>
          )}
        </div>
      </div>
    );
  }, [assistant]);

  const formatMessages = useCallback((messagesList) => {
    return messagesList.map((msg) => {
      let formattedContent = "";

      if (typeof msg.content === "string") {
        formattedContent = msg.content;
      } else if (Array.isArray(msg.content)) {
        formattedContent = msg.content
          .map((item) => {
            if (typeof item === "string") {
              return item;
            } else if (item.text) {
              return item.text.value;
            } else if (item.content) {
              return item.content;
            }
            return "";
          })
          .filter(Boolean)
          .join("\n");
      } else if (msg.content && typeof msg.content === "object") {
        if (msg.content.text) {
          formattedContent = msg.content.text;
        } else if (msg.content.content) {
          formattedContent = msg.content.content;
        } else {
          formattedContent = JSON.stringify(msg.content, null, 2);
        }
      }

      return {
        ...msg,
        content: formattedContent,
      };
    });
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl w-full max-h-screen h-full flex flex-col"
        aria-label="Chat Dialog"
      >
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <DialogTitle>{assistant?.name || "Chat"}</DialogTitle>
            <button
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="text-muted-foreground hover:text-primary focus:outline-none"
              aria-label="Toggle Assistant Details"
            >
              {detailsOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
          {detailsOpen && renderAssistantDetails()}
          <Separator />
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea
            ref={scrollRef}
            className="flex-1 p-4"
            onScroll={handleScroll}
          >
            <div className="space-y-6 pb-4">
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

          <div className="p-4 bg-background">
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

export default React.memo(ChatDialog);

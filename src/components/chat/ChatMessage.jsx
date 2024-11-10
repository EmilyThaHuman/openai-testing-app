import React, { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import FilePreview from "./FilePreview";
import { markdownComponents } from "./MarkdownComponents";
import { MessageToolbar } from "./MessageToolbar";
import { formatDistanceToNow } from "date-fns";

export const ChatMessage = memo(
  ({ message, isUser, files, onRegenerate, onFeedback }) => {
    const formattedTime = message.timestamp
      ? formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })
      : "";
    // Ensure message content is a string
    const messageContent =
      typeof message.content === "string"
        ? message.content
        : JSON.stringify(message.content);

    // Process message content with proper type handling
    const processedContent = useMemo(() => {
      if (!message.content) return "";

      // Handle array of content
      if (Array.isArray(message.content)) {
        return message.content
          .map((item) => {
            if (typeof item === "string") return item;
            if (item.type === "text") return item.text;
            if (typeof item.content === "string") return item.content;
            return "";
          })
          .filter(Boolean)
          .join("\n");
      }

      // Handle object content
      if (typeof message.content === "object") {
        if (message.content.type === "text") return message.content.text;
        if (message.content.content) return message.content.content;
        return JSON.stringify(message.content, null, 2);
      }

      // Handle string content
      if (typeof message.content === "string") {
        return message.content;
      }

      // Fallback
      return JSON.stringify(message.content, null, 2);
    }, [message.content]);

    // Debug logging
    console.log("Processed content:", {
      original: message.content,
      processed: processedContent,
    });

    return (
      <Card
        className={cn(
          "p-4 rounded-lg group relative",
          isUser ? "ml-8 bg-accent" : "mr-8 bg-muted"
        )}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
            </p>
            <p className="text-xs text-muted-foreground">{formattedTime}</p>
          </div>

          <MessageToolbar
            message={message}
            onRegenerate={onRegenerate}
            onFeedback={onFeedback}
            isAssistant={!isUser}
          />
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {processedContent && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
            >
              {processedContent}
            </ReactMarkdown>
          )}
        </div>

        {files?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <FilePreview key={index} file={file} />
            ))}
          </div>
        )}

        {message.metadata?.model && (
          <div className="mt-2 text-xs text-muted-foreground">
            Model: {message.metadata.model}
          </div>
        )}
      </Card>
    );
  }
);

ChatMessage.displayName = "ChatMessage";

export default { ChatMessage };

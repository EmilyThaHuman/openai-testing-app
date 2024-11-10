import React, { memo } from "react";
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

    // Handle content that might be in different formats
    const getMessageContent = () => {
      if (Array.isArray(message.content)) {
        return message.content
          .map((item) => {
            if (typeof item === "string") return item;
            if (item.text) return item.text;
            return "";
          })
          .join("\n");
      }
      return messageContent;
    };

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
          {messageContent && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
            >
              {getMessageContent()}
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

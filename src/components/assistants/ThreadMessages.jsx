import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ThreadMessages({
  threadMessages,
  loading,
  selectedAssistant,
  streamingMessages,
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const allThreads = Object.entries(threadMessages);

  if (allThreads.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No thread messages available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {allThreads.map(([threadId, messages]) => (
        <Card key={threadId} className="p-4">
          <div className="mb-2 font-semibold">Thread ID: {threadId}</div>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg p-3 ${
                    message.role === "assistant"
                      ? "bg-primary/10 ml-4"
                      : "bg-muted mr-4"
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
                  </div>
                  <div className="text-sm">
                    {message.content[0]?.text?.value || ""}
                  </div>
                </div>
              ))}
              {streamingMessages[threadId] && (
                <div className="rounded-lg p-3 bg-primary/10 ml-4">
                  <div className="text-sm font-medium mb-1">Assistant</div>
                  <div className="text-sm">{streamingMessages[threadId]}</div>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      ))}
    </div>
  );
} 
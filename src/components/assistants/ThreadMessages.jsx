import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreShallow } from "@/store/useStore";
import { MessageSquare } from "lucide-react";

export default function ThreadMessages() {
  const store = useStoreShallow();
  const threads = store.threads[store.selectedAssistant?.id] || [];
  const threadMessages = store.threadMessages;
  const streamingMessages = store.streamingAssistantChatMessages;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchThreadMessages = async () => {
      if (!threads || threads.length === 0) return;
      
      setIsLoading(true);
      try {
        // Assuming store has a method to fetch messages for multiple threads
        await Promise.all(
          threads.map(thread => store.fetchThreadMessages(thread.id))
        );
      } catch (error) {
        console.error("Error fetching thread messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreadMessages();
  }, [threads, store]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-1/4 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Ensure threadMessages is an object and has entries
  if (!threadMessages || typeof threadMessages !== 'object' || Object.keys(threadMessages).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 text-muted-foreground">
        <MessageSquare className="h-12 w-12 opacity-50" />
        <p>No messages available</p>
      </div>
    );
  }

  // Filter out null/undefined values and create entries array
  const validThreadEntries = Object.entries(threadMessages).filter(
    ([threadId, messages]) => 
      threadId && 
      Array.isArray(messages) && 
      messages.length > 0
  );

  return (
    <div className="space-y-6">
      {validThreadEntries.map(([threadId, messages]) => (
        <Card key={`thread-${threadId}`} className="p-4">
          <div className="mb-2 font-semibold">Thread ID: {threadId}</div>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={`message-${message?.id || Date.now()}-${Math.random()}`}
                  className={`rounded-lg p-3 ${
                    message?.role === "assistant"
                      ? "bg-primary/10 ml-4"
                      : "bg-muted mr-4"
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {message?.role?.charAt(0).toUpperCase() +
                      message?.role?.slice(1)}
                  </div>
                  <div className="text-sm">
                    {message?.content?.[0]?.text?.value || ""}
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

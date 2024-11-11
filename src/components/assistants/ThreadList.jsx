import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const ThreadList = ({
  threads,
  loading,
  selectedThread,
  onThreadSelect,
  expandedThreads,
  onThreadExpand,
}) => {
  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  // Ensure threads is an array
  const threadArray = Array.isArray(threads) ? threads : [];

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2 p-1">
        {threadArray.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No threads available
          </div>
        ) : (
          threadArray.map((thread) => (
            <Card
              key={thread.id}
              className={`p-3 cursor-pointer hover:bg-gray-100 ${
                selectedThread?.id === thread.id ? "bg-gray-100" : ""
              }`}
              onClick={() => onThreadSelect(thread)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Thread {thread.id}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(thread.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default ThreadList;

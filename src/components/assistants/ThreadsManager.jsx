import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Trash2,
  MoreVertical,
  RefreshCw,
  Plus,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStoreShallow } from "@/store/useStore";
import { uniqueId } from "lodash";

export function ThreadsManager({ onThreadSelect, selectedThread }) {
  const store = useStoreShallow();
  const selectedAssistantId = store.selectedAssistant?.id;
  const threads = store?.threads?.[selectedAssistantId] || [];
  const setThreads = store.setThreads;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get threads from OpenAI API
      const response = await UnifiedOpenAIService.threads.list();

      if (response?.data) {
        // Sort threads by creation date, newest first
        const sortedThreads = response.data.sort((a, b) => {
          const dateA =
            a && a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB =
            b && b.created_at ? new Date(b.created_at) : new Date(0);
          return dateB - dateA;
        });
        // Filter out null or undefined threads
        const filteredThreads = sortedThreads.filter(
          (thread) => thread !== null && thread !== undefined
        );

        // Add metadata if available for each thread
        const threadsWithMetadata = await Promise.all(
          filteredThreads.map(async (thread) => {
            try {
              // Get the last message for the thread if it exists
              const messages = await UnifiedOpenAIService.threads.messages.list(
                thread.id
              );
              const lastMessage = messages?.data?.[0];

              return {
                ...thread,
                metadata: {
                  ...thread.metadata,
                  lastMessage: lastMessage?.content?.[0]?.text?.value || null,
                  messageCount: messages?.data?.length || 0,
                  lastActivity: lastMessage?.created_at || thread.created_at,
                },
              };
            } catch (err) {
              console.warn(
                `Failed to fetch metadata for thread ${thread.id}:`,
                err
              );
              return thread;
            }
          })
        );

        setThreads(threadsWithMetadata);
        localStorage.setItem(
          "openai_threads",
          JSON.stringify(threadsWithMetadata)
        );
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
      setError(error);
      toast({
        title: "Error fetching threads",
        description: error.message || "Failed to load threads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    if (selectedAssistantId) {
      store.fetchThreadsForAssistant(selectedAssistantId);
    }
  }, [selectedAssistantId]);

  const handleCreateThread = async () => {
    try {
      setLoading(true);
      const thread = await UnifiedOpenAIService.threads.create();
      console.log("Created thread:", thread);

      // Add the new thread to the list
      setThreads((prev) => [thread, ...prev]);

      toast({
        title: "Thread created",
        description: "New thread has been created successfully",
      });

      return thread;
    } catch (error) {
      console.error("Error creating thread:", error);
      toast({
        title: "Error creating thread",
        description: error.message || "Failed to create thread",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteThread = async (threadId) => {
    try {
      setLoading(true);
      await UnifiedOpenAIService.threads.delete(threadId);

      // Remove the thread from the list
      setThreads((prev) => prev.filter((t) => t.id !== threadId));

      toast({
        title: "Thread deleted",
        description: "Thread has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting thread:", error);
      toast({
        title: "Error deleting thread",
        description: error.message || "Failed to delete thread",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Threads</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchThreads}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={handleCreateThread} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            New Thread
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <AnimatePresence mode="popLayout">
          {loading ? (
            // Loading skeletons
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : threads?.length === 0 ? (
            // Empty state
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center p-8 text-center space-y-4"
            >
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              <div className="space-y-2">
                <h3 className="font-semibold">No threads yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create a new thread to start a conversation
                </p>
              </div>
            </motion.div>
          ) : (
            // Thread list
            <div className="space-y-3">
              {Array.isArray(threads) &&
                threads
                  .filter(Boolean) // Filter out null/undefined threads
                  .map((thread) => {
                    if (!thread) return null; // Additional safety check

                    return (
                      <motion.div
                        key={uniqueId()}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <Card
                          className={`
              p-4 transition-all duration-200 ease-in-out cursor-pointer
              hover:shadow-md hover:border-primary/20
              ${selectedThread?.id === thread?.id ? "bg-accent" : "hover:bg-accent/50"}
            `}
                          onClick={() => onThreadSelect(thread)}
                        >
                          <div className="flex justify-between items-start space-x-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-sm font-medium truncate">
                                  Thread {thread.id.slice(-8)}
                                </h3>
                                <Badge variant="secondary">
                                  {thread.metadata?.messageCount || 0} messages
                                </Badge>
                              </div>
                              {thread.metadata?.lastMessage && (
                                <p className="text-sm text-muted-foreground truncate mt-1">
                                  {thread.metadata.lastMessage}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                Last active:{" "}
                                {formatRelativeTime(
                                  thread.metadata?.lastActivity ||
                                    thread.created_at
                                )}
                              </p>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteThread(thread.id);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Thread
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Add a visual indicator if the thread is selected */}
                          {selectedThread?.id === thread.id && (
                            <motion.div
                              layoutId="selectedIndicator"
                              className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            />
                          )}
                        </Card>
                      </motion.div>
                    );
                  })}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
          {error.message || "An error occurred while loading threads"}
        </div>
      )} */}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageSquare, ChevronRight, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../ui/input";

const ThreadList = ({
  threads,
  loading,
  selectedThread,
  onThreadSelect,
  expandedThreads,
  onThreadExpand,
  assistants = [],
  onCreateThread,
  selectedAssistant,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAssistantId, setSelectedAssistantId] = useState(
    selectedAssistant?.id || ""
  );
  const [initialMessage, setInitialMessage] = useState("");

  useEffect(() => {
    setSelectedAssistantId(selectedAssistant?.id || "");
  }, [selectedAssistant]);

  // Loading state UI
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Ensure threads is an array
  const threadArray = Array.isArray(threads) ? threads : [];

  const handleCreateThread = async () => {
    if (!selectedAssistantId) return;
    await onCreateThread?.(selectedAssistantId);
    setIsCreateDialogOpen(false);
    setSelectedAssistantId("");
  };

  // Format date to relative time
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
      {/* Create Thread Button */}
      <Button
        className="w-full flex items-center justify-center gap-2"
        onClick={() => setIsCreateDialogOpen(true)}
      >
        <PlusCircle className="h-4 w-4" />
        New Thread
      </Button>

      {/* Threads List */}
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <AnimatePresence mode="popLayout">
          {threadArray.length === 0 ? (
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
                  Create a new thread to start a conversation with an assistant
                </p>
              </div>
              <div className="space-y-4 w-full max-w-md">
                <Select
                  value={selectedAssistantId}
                  onValueChange={(value) => {
                    setSelectedAssistantId(value);
                    const assistant = assistants.find((a) => a.id === value);
                    setSelectedAssistant(assistant);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    {assistants.map((assistant) => (
                      <SelectItem key={assistant.id} value={assistant.id}>
                        {assistant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Type your initial message..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  className="w-full"
                />

                <Button
                  onClick={() =>
                    onCreateThread(selectedAssistantId, initialMessage)
                  }
                  disabled={!selectedAssistantId || !initialMessage.trim()}
                  className="w-full"
                >
                  Start Conversation
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(threadArray) &&
                threads
                  .filter(Boolean) // Filter out null/undefined threads
                  .map((thread) => {
                    if (!thread) return null; // Additional safety check

                    return (
                      <motion.div
                        key={thread.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <Card
                          className={`
                      p-4 transition-all duration-200 ease-in-out cursor-pointer
                      hover:shadow-md hover:border-primary/20
                      ${selectedThread?.id === thread.id ? "bg-accent" : "hover:bg-accent/50"}
                    `}
                          onClick={() => onThreadSelect(thread)}
                        >
                          <div className="flex justify-between items-start space-x-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-sm font-medium truncate">
                                  Thread {thread.id.slice(-8)}
                                </h3>
                                {thread.status && (
                                  <Badge
                                    variant={
                                      thread.status === "completed"
                                        ? "success"
                                        : thread.status === "running"
                                          ? "default"
                                          : "secondary"
                                    }
                                  >
                                    {thread.status}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatRelativeTime(thread.created_at)}
                              </p>
                              {thread.metadata?.lastMessage && (
                                <p className="text-sm text-muted-foreground truncate mt-2">
                                  {thread.metadata.lastMessage}
                                </p>
                              )}
                            </div>
                            <ChevronRight
                              className={`h-5 w-5 text-muted-foreground/50 transition-transform ${
                                selectedThread?.id === thread.id
                                  ? "rotate-90"
                                  : ""
                              }`}
                            />
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Create Thread Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Thread</DialogTitle>
            <DialogDescription>
              Select an assistant and start your conversation
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <Select
              value={selectedAssistantId}
              onValueChange={setSelectedAssistantId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an assistant" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Available Assistants</SelectLabel>
                  {assistants.map((assistant) => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      <div className="flex items-center gap-2">
                        <span>{assistant.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {assistant.model}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Input
              placeholder="Type your initial message..."
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setInitialMessage("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateThread}
              disabled={!selectedAssistantId || !initialMessage.trim()}
            >
              Start Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThreadList;

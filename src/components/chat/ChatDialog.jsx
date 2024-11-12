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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { formatDate } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { MODELS, TOOLS } from "@/constants/assistantConstants";
import { InstructionsGenerator } from "@/components/shared/InstructionsGenerator";
import { GENERATOR_TYPES } from "@/utils/instructionsGenerator";
import { toast } from "@/components/ui/use-toast";

const AssistantInstructions = ({ instructions }) => {
  if (!instructions) return null;
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="cursor-pointer bg-muted/10 p-2 rounded-md">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {instructions}
          </p>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 max-h-96 overflow-auto p-4">
        <h4 className="font-semibold mb-2">Instructions</h4>
        <p className="text-sm whitespace-pre-wrap">{instructions}</p>
      </HoverCardContent>
    </HoverCard>
  );
};
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
  onUpdateAssistant,
}) {
  const scrollRef = useRef(null);
  const isNearBottomRef = useRef(true);
    const [detailsOpen, setDetailsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAssistant, setEditedAssistant] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize edit form when assistant changes
  useEffect(() => {
    if (assistant) {
      setEditedAssistant({
        ...assistant,
        tools: assistant.tools?.map(tool => tool.type) || [],
      });
    }
  }, [assistant]);

  // Check if user is near the bottom
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      isNearBottomRef.current = distanceFromBottom < 100;
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && isNearBottomRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

    const handleSave = async () => {
    if (!editedAssistant) return;

    setIsSaving(true);
    try {
      // Format tools array for API
      const formattedAssistant = {
        ...editedAssistant,
        tools: editedAssistant.tools.map(tool => ({ type: tool })),
      };

      await onUpdateAssistant(formattedAssistant);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Assistant updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update assistant",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };


    const renderAssistantDetailsEdit = () => {
    if (!editedAssistant) return null;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={editedAssistant.name}
            onChange={(e) =>
              setEditedAssistant((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Assistant Name"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={editedAssistant.description || ""}
            onChange={(e) =>
              setEditedAssistant((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Description"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Instructions</Label>
          <InstructionsGenerator
            type={GENERATOR_TYPES.SYSTEM}
            value={editedAssistant.instructions || ""}
            onChange={(value) =>
              setEditedAssistant((prev) => ({
                ...prev,
                instructions: value,
              }))
            }
            title="System Instructions"
            placeholder="Enter system instructions"
          />
        </div>

        <div className="space-y-2">
          <Label>Model</Label>
          <Select
            value={editedAssistant.model}
            onValueChange={(value) =>
              setEditedAssistant((prev) => ({ ...prev, model: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MODELS).map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tools</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TOOLS).map(([id, name]) => (
              <Badge
                key={id}
                variant={
                  editedAssistant.tools.includes(id) ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() =>
                  setEditedAssistant((prev) => ({
                    ...prev,
                    tools: prev.tools.includes(id)
                      ? prev.tools.filter((t) => t !== id)
                      : [...prev.tools, id],
                  }))
                }
              >
                {name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAssistantDetailsView = useCallback(() => {
    if (!assistant) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{assistant.name}</h2>
          <div className="flex items-center gap-2">
            <Badge
              variant={assistant.status === "active" ? "success" : "secondary"}
            >
              {assistant.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {assistant.description && (
          <DialogDescription className="text-sm text-muted-foreground">
            {assistant.description}
          </DialogDescription>
        )}

        {assistant.instructions && (
          <div className="bg-muted/10 p-4 rounded-lg">
            <p className="font-semibold mb-2">Instructions:</p>
            <p className="text-sm">{assistant.instructions}</p>
          </div>
        )}

        {assistant.tools?.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold">Tools:</p>
            <div className="flex flex-wrap gap-2">
              {assistant.tools.map((tool, index) => (
                <Badge key={index} variant="outline">
                  {tool.type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 bg-muted/5 p-2 rounded">
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
      <DialogContent className="sm:max-w-3xl w-full max-h-[90vh] h-[90vh] flex flex-col">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? "Edit Assistant" : assistant?.name || "Chat"}
              {isEditing && (
                <Badge variant="outline" className="ml-2">
                  Editing
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <AlertCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </>
              ) : (
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
              )}
            </div>
          </div>
          {detailsOpen && (
            <div className="bg-muted/5 rounded-lg p-4">
              {isEditing ? renderAssistantDetailsEdit() : renderAssistantDetailsView()}
            </div>
          )}

          {detailsOpen && assistant?.instructions && (
            <AssistantInstructions instructions={assistant.instructions} />
          )}
          <Separator />
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea
            ref={scrollRef}
            className="flex-1 px-4"
            onScroll={handleScroll}
          >
            <div className="space-y-6 py-4">
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
                <div className="text-sm text-muted-foreground animate-pulse flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error.message || "Something went wrong"}</span>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 bg-background border-t">
            <ChatInput
              onSend={onSendMessage}
              onFileUpload={onFileUpload}
              disabled={isLoading || isEditing}
              placeholder={
                isLoading
                  ? "Assistant is thinking..."
                  : isEditing
                  ? "Please save or cancel changes first"
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

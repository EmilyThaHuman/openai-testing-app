import React from 'react';
import { useStoreSelector } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Info, 
  MessageSquare,
  FileText,
  Code,
  Trash2 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ChatHeader({ 
  assistant, 
  messageCount = 0,
  isStreaming,
  onClearChat,
  onSettingsClick 
}) {
  const { isLoading } = useStoreSelector(state => ({
    isLoading: state.isLoading
  }));

  if (!assistant) return null;

  const toolIcons = {
    'code_interpreter': <Code className="h-4 w-4" />,
    'retrieval': <FileText className="h-4 w-4" />,
    'function': <MessageSquare className="h-4 w-4" />
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">{assistant.name}</h2>
          <Badge variant={assistant.status === "active" ? "success" : "secondary"}>
            {assistant.status}
          </Badge>
          {isStreaming && (
            <Badge variant="outline" className="animate-pulse">
              Streaming
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                disabled={isLoading || messageCount === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All messages will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearChat}>
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onSettingsClick}
                disabled={isLoading}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p>Messages: {messageCount}</p>
                <p>Model: {assistant.model}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {assistant.description && (
        <p className="text-sm text-muted-foreground">
          {assistant.description}
        </p>
      )}

      {assistant.tools?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {assistant.tools.map((tool) => (
            <Tooltip key={tool.type}>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="flex items-center gap-1">
                  {toolIcons[tool.type]}
                  {tool.type}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {tool.type === 'function' 
                  ? `Function: ${tool.function?.name}`
                  : `${tool.type} enabled`}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}

      <Separator />
    </div>
  );
}

ChatHeader.displayName = 'ChatHeader';

export default React.memo(ChatHeader); 
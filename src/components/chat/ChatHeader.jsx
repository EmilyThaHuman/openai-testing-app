import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Info, 
  MessageSquare,
  FileText,
  Code
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const ChatHeader = memo(({ 
  assistant, 
  onSettingsClick,
  messageCount = 0,
  isStreaming 
}) => {
  if (!assistant) return null;

  const toolIcons = {
    'code_interpreter': <Code className="h-4 w-4" />,
    'retrieval': <FileText className="h-4 w-4" />,
    'function': <MessageSquare className="h-4 w-4" />,
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onSettingsClick}>
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Assistant Settings</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4" />
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

      <div className="flex flex-wrap gap-2">
        {assistant.tools?.map((tool) => (
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

      <Separator />
    </div>
  );
});

ChatHeader.displayName = 'ChatHeader'; 
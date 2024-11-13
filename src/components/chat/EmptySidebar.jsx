import React from "react";
import { MessageSquarePlus, History, Star, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export const EmptySidebar = ({ onNewChat }) => {
  return (
    <div className="flex flex-col h-full">
      <Button onClick={onNewChat} className="w-full mb-4 gap-2">
        <MessageSquarePlus className="h-4 w-4" />
        New Chat
      </Button>

      <ScrollArea className="flex-1">
        <div className="space-y-4 px-1">
          {/* Recent Chats Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
              <History className="h-4 w-4" />
              <span>Recent Chats</span>
            </div>
            <Card className="p-4 border-dashed flex items-center justify-center min-h-[100px] bg-muted/50">
              <p className="text-sm text-muted-foreground text-center px-2">
                Your recent chats will appear here
              </p>
            </Card>
          </div>

          {/* Favorites Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>Favorites</span>
            </div>
            <Card className="p-4 border-dashed flex items-center justify-center min-h-[100px] bg-muted/50">
              <p className="text-sm text-muted-foreground text-center px-2">
                Star chats to add them to favorites
              </p>
            </Card>
          </div>

          {/* Archived Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
              <Archive className="h-4 w-4" />
              <span>Archived</span>
            </div>
            <Card className="p-4 border-dashed flex items-center justify-center min-h-[100px] bg-muted/50">
              <p className="text-sm text-muted-foreground text-center px-2">
                Archive chats to keep them for later
              </p>
            </Card>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2 text-sm">Quick Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-mono bg-background rounded px-1">⌘N</span>
                <span>Create new chat</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono bg-background rounded px-1">⌘K</span>
                <span>Search chats</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono bg-background rounded px-1">⌘S</span>
                <span>Save to favorites</span>
              </li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default EmptySidebar;

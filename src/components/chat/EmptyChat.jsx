import React from "react";
import { useStoreSelector } from '@/store/useStore';
import { MessageSquarePlus, Wand2, Settings2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const EmptyChat = () => {
  const { createChat } = useStoreSelector(state => ({
    createChat: state.createChat
  }));

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/50">
      <Card className="max-w-2xl w-full p-8 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Welcome to Chat</h2>
          <p className="text-muted-foreground text-lg">
            Start a new conversation and explore the possibilities
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <MessageSquarePlus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">New Conversation</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Begin a fresh chat with customizable settings and features
            </p>
            <Button onClick={createChat} className="w-full">
              Start Chat
            </Button>
          </Card>

          <Card className="p-6 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Wand2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">AI Features</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Advanced AI models, temperature control, and intelligent responses
            </p>
            <Button variant="outline" className="w-full">
              Learn More
            </Button>
          </Card>

          <Card className="p-6 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Customize</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure chat settings, models, and response parameters
            </p>
            <Button variant="outline" className="w-full">
              View Settings
            </Button>
          </Card>

          <Card className="p-6 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">File Support</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload and process files for enhanced conversations
            </p>
            <Button variant="outline" className="w-full">
              Upload Files
            </Button>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help getting started? Check out our documentation or tutorials.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default EmptyChat;

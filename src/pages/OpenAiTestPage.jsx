// OpenAITestPage.js

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import CompletionTesting from "@/components/openai-testing/tabs/CompletionTesting";
import AudioTesting from "@/components/openai-testing/tabs/AudioTesting";
import ImageTesting from "@/components/openai-testing/tabs/ImageTesting";
import AssistantTesting from "@/components/openai-testing/tabs/AssistantTesting";
import ChatTesting from "@/components/openai-testing/tabs/ChatTesting";
import FineTuneTesting from "@/components/openai-testing/tabs/FineTuneTesting";
import ModerationTesting from "@/components/openai-testing/tabs/ModerationTesting";

const OpenAITestPage = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">OpenAI API Testing</h1>
      
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="assistants">Assistants</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="finetune">Fine-tune</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="chat">
            <Card className="p-6">
              <ChatTesting />
            </Card>
          </TabsContent>

          <TabsContent value="assistants">
            <Card className="p-6">
              <AssistantTesting />
            </Card>
          </TabsContent>

          <TabsContent value="audio">
            <Card className="p-6">
              <AudioTesting />
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card className="p-6">
              <ImageTesting />
            </Card>
          </TabsContent>

          <TabsContent value="finetune">
            <Card className="p-6">
              <FineTuneTesting />
            </Card>
          </TabsContent>

          <TabsContent value="moderation">
            <Card className="p-6">
              <ModerationTesting />
            </Card>
          </TabsContent>

          <TabsContent value="completion">
            <Card className="p-6">
              <CompletionTesting />
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default OpenAITestPage;

// OpenAITestPage.js

import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import CompletionTesting from "@/components/openai-testing/tabs/CompletionTesting"
import AudioTesting from "@/components/openai-testing/tabs/AudioTesting"
import ImageTesting from "@/components/openai-testing/tabs/ImageTesting"
import AssistantTesting from "@/components/openai-testing/tabs/AssistantTesting"
import ChatTesting from "@/components/openai-testing/tabs/ChatTesting"
import FineTuneTesting from "@/components/openai-testing/tabs/FineTuneTesting"
import ModerationTesting from "@/components/openai-testing/tabs/ModerationTesting"

const OpenAITestPage = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      <div className="container flex-1 flex flex-col py-6 gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">OpenAI API Testing</h1>
          <p className="text-muted-foreground">
            Test and experiment with different OpenAI API endpoints
          </p>
        </div>
        
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="assistants">Assistants</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="finetune">Fine-tune</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="completion">Completion</TabsTrigger>
          </TabsList>

          <div className="flex-1 flex flex-col mt-6">
            <TabsContent value="chat" className="flex-1">
              <Card className="p-6 h-full">
                <ChatTesting />
              </Card>
            </TabsContent>

            <TabsContent value="assistants" className="flex-1">
              <Card className="p-6 h-full">
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
    </div>
  )
}

export default OpenAITestPage

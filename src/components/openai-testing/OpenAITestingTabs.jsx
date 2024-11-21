import React, { useState } from 'react';
import { useStoreSelector } from '@/store/useStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssistantTesting from './tabs/AssistantTesting';
import ChatTesting from './tabs/ChatTesting';
import CompletionTesting from './tabs/CompletionTesting';
import ImageTesting from './tabs/ImageTesting';
import AudioTesting from './tabs/AudioTesting';
import FileTesting from './tabs/FileTesting';
import FineTuneTesting from './tabs/FineTuneTesting';

export const OpenAITestingTabs = () => {
  const { activeTab, setActiveTab } = useStoreSelector(state => ({
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab
  }));

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="w-full"
    >
      <TabsList className="grid grid-cols-7 w-full">
        <TabsTrigger value="assistants">Assistants</TabsTrigger>
        <TabsTrigger value="chat">Chat</TabsTrigger>
        <TabsTrigger value="completion">Completion</TabsTrigger>
        <TabsTrigger value="image">Image</TabsTrigger>
        <TabsTrigger value="audio">Audio</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="fine-tune">Fine-tune</TabsTrigger>
      </TabsList>

      <TabsContent value="assistants">
        <AssistantTesting />
      </TabsContent>
      <TabsContent value="chat">
        <ChatTesting />
      </TabsContent>
      <TabsContent value="completion">
        <CompletionTesting />
      </TabsContent>
      <TabsContent value="image">
        <ImageTesting />
      </TabsContent>
      <TabsContent value="audio">
        <AudioTesting />
      </TabsContent>
      <TabsContent value="files">
        <FileTesting />
      </TabsContent>
      <TabsContent value="fine-tune">
        <FineTuneTesting />
      </TabsContent>
    </Tabs>
  );
}; 
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InteractiveAssistant from './tabs/InteractiveAssistant';
import AssistantFunctionCalling from './tabs/AssistantFunctionCalling';
import AssistantFileProcessing from './tabs/AssistantFileProcessing';

export const AssistantInstancesTabs = () => {
  const [activeMainTab, setActiveMainTab] = useState('assistants');

  return (
    <Tabs
      value={activeMainTab}
      onValueChange={setActiveMainTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-7 w-full">
        {/* <TabsTrigger value="asst-instances">Assistant Instances</TabsTrigger> */}
        <TabsTrigger value="asst-interactive">Interactive</TabsTrigger>
        <TabsTrigger value="asst-function-calling">
          Function Calling
        </TabsTrigger>
        <TabsTrigger value="asst-file-processing">File Processing</TabsTrigger>
      </TabsList>

      {/* <TabsContent value="asst-instances">
        <AssistantInstances />
      </TabsContent> */}
      <TabsContent value="asst-interactive">
        <InteractiveAssistant />
      </TabsContent>
      <TabsContent value="asst-function-calling">
        <AssistantFunctionCalling />
      </TabsContent>
      <TabsContent value="asst-file-processing">
        <AssistantFileProcessing />
      </TabsContent>
    </Tabs>
  );
};

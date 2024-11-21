// OpenAITestPage.js

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import InteractiveAssistant from '@/components/openai-assistant-instances/tabs/InteractiveAssistant';
import AssistantFunctionCalling from '@/components/openai-assistant-instances/tabs/AssistantFunctionCalling';
import AssistantFileProcessing from '@/components/openai-assistant-instances/tabs/AssistantFileProcessing';

const AssistantInstancesTestPage = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">
        Assistant Instances API Testing
      </h1>

      <Tabs defaultValue="asst-interactive" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="asst-interactive">Interactive</TabsTrigger>
          <TabsTrigger value="asst-function-calling">
            Function Calling
          </TabsTrigger>
          <TabsTrigger value="asst-file-processing">
            File Processing
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="asst-interactive">
            <Card className="p-6">
              <InteractiveAssistant />
            </Card>
          </TabsContent>

          <TabsContent value="asst-function-calling">
            <Card className="p-6">
              <AssistantFunctionCalling />
            </Card>
          </TabsContent>

          <TabsContent value="asst-file-processing">
            <Card className="p-6">
              <AssistantFileProcessing />
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AssistantInstancesTestPage;

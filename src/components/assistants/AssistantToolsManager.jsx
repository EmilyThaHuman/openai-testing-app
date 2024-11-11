import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, PlusCircle, Settings, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import tools from "@/lib/constants/tools";

const AssistantToolsManager = () => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [attachedTools, setAttachedTools] = useState([]);

  const handleAttachTool = () => {
    if (
      selectedTool &&
      !attachedTools.find((t) => t.name === selectedTool.name)
    ) {
      setAttachedTools([...attachedTools, selectedTool]);
    }
  };

  const handleRemoveTool = (toolName) => {
    setAttachedTools(attachedTools.filter((tool) => tool.name !== toolName));
  };

  const renderJsonSchema = (schema) => {
    return (
      <div className="font-mono text-sm">
        <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
          {JSON.stringify(schema, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assistant Tools Manager</CardTitle>
          <CardDescription>
            Manage and configure tools for your OpenAI Assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="available" className="w-full">
            <TabsList>
              <TabsTrigger value="available">Available Tools</TabsTrigger>
              <TabsTrigger value="attached">
                Attached Tools
                {attachedTools.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {attachedTools.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available">
              <div className="grid md:grid-cols-5 gap-6">
                <Card className="md:col-span-5">
                  <CardHeader>
                    <CardTitle className="text-lg">Available Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea
                      className="w-full whitespace-nowrap pb-4"
                      orientation="horizontal"
                    >
                      <div className="inline-flex gap-3 px-1">
                        {tools.map((tool) => (
                          <div
                            key={tool.name}
                            className={`group relative flex-shrink-0 w-40 p-4 rounded-lg cursor-pointer transition-all
                              ${
                                selectedTool?.name === tool.name
                                  ? "bg-primary/10 border border-primary/20"
                                  : "hover:bg-gray-50 border border-transparent"
                              }`}
                            onClick={() => setSelectedTool(tool)}
                          >
                            <div className="flex flex-col items-center gap-2 text-center">
                              <Settings className="w-6 h-6" />
                              <span className="font-medium text-sm truncate w-full">
                                {tool.name}
                              </span>
                            </div>

                            {/* Tooltip */}
                            <div className="absolute opacity-0 group-hover:opacity-100 z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg whitespace-normal w-64 text-center pointer-events-none transition-opacity">
                              {tool.description}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-2">
                                <div className="border-8 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-lg">Tool Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedTool ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-gray-600">
                            {selectedTool.description}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Parameters</h4>
                          {renderJsonSchema(selectedTool.parameters)}
                        </div>
                        <Button
                          className="w-full mt-4"
                          onClick={handleAttachTool}
                          disabled={attachedTools.some(
                            (t) => t.name === selectedTool.name
                          )}
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          {attachedTools.some(
                            (t) => t.name === selectedTool.name
                          )
                            ? "Already Attached"
                            : "Attach Tool"}
                        </Button>
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No tool selected</AlertTitle>
                        <AlertDescription>
                          Select a tool from the list to preview its details
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attached">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attached Tools</CardTitle>
                  <CardDescription>
                    Tools that will be available to your assistant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {attachedTools.length > 0 ? (
                    <div className="space-y-4">
                      {attachedTools.map((tool) => (
                        <div
                          key={tool.name}
                          className="group relative flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">{tool.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveTool(tool.name)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>

                          {/* Tooltip */}
                          <div className="absolute opacity-0 group-hover:opacity-100 z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg whitespace-nowrap pointer-events-none transition-opacity">
                            {tool.description}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-2">
                              <div className="border-8 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No tools attached</AlertTitle>
                      <AlertDescription>
                        Add tools from the Available Tools tab to see them here
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistantToolsManager;

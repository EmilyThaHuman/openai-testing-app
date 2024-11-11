import React, { useMemo, useCallback } from "react";
import { useStoreShallow } from "@/store/useStore";
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
import {
  AlertCircle,
  PlusCircle,
  Settings,
  Trash2,
  Code,
  Database,
  FunctionSquare,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "@/components/ui/tooltip";

const ToolCard = React.memo(({ tool, isSelected, onClick }) => {
  const icon = useMemo(() => {
    switch (tool.type) {
      case "function":
        return <FunctionSquare className="w-6 h-6" />;
      case "code":
        return <Code className="w-6 h-6" />;
      case "retrieval":
        return <Database className="w-6 h-6" />;
      default:
        return <Settings className="w-6 h-6" />;
    }
  }, [tool.type]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative flex-shrink-0 w-40 p-4 rounded-lg cursor-pointer transition-all",
        isSelected
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-gray-50 border border-transparent"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        {icon}
        <span className="font-medium text-sm truncate w-full">{tool.name}</span>
      </div>
      <Tooltip content={tool.description} />
    </motion.div>
  );
});

const JsonSchemaViewer = React.memo(({ schema }) => (
  <div className="font-mono text-sm">
    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-[300px] scrollbar-thin">
      {JSON.stringify(schema, null, 2)}
    </pre>
  </div>
));

export const AssistantToolsManager = () => {
  const store = useStoreShallow((state) => ({
    selectedTool: state.selectedTool,
    attachedTools: state.attachedTools,
    setSelectedTool: state.setSelectedTool,
    attachTool: state.attachTool,
    removeTool: state.removeTool,
  }));

  const handleAttachTool = useCallback(
    (tool) => {
      if (!store.attachedTools.some((t) => t.name === tool.name)) {
        store.attachTool(tool);
      }
    },
    [store.attachedTools, store.attachTool]
  );

  const toolsCount = useMemo(() => attachedTools.length, [attachedTools]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Assistant Tools Manager
          </CardTitle>
          <CardDescription className="text-lg">
            Configure and manage tools for your OpenAI Assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="available">Available Tools</TabsTrigger>
              <TabsTrigger value="attached">
                Attached Tools
                {toolsCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {toolsCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="available">
                <div className="grid lg:grid-cols-5 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Available Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="grid grid-cols-1 gap-4">
                          {tools?.map((tool) => (
                            <ToolCard
                              key={tool.name}
                              tool={tool}
                              isSelected={selectedTool?.name === tool.name}
                              onClick={() => setSelectedTool(tool)}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-3">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Tool Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AnimatePresence mode="wait">
                        {selectedTool ? (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                          >
                            <div>
                              <h4 className="text-lg font-semibold mb-2">
                                Description
                              </h4>
                              <p className="text-gray-600 dark:text-gray-300">
                                {selectedTool.description}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold mb-2">
                                Parameters
                              </h4>
                              <JsonSchemaViewer
                                schema={selectedTool.parameters}
                              />
                            </div>
                            <Button
                              className="w-full"
                              size="lg"
                              onClick={handleAttachTool}
                              disabled={attachedTools.some(
                                (t) => t.name === selectedTool.name
                              )}
                            >
                              <PlusCircle className="w-5 h-5 mr-2" />
                              {attachedTools.some(
                                (t) => t.name === selectedTool.name
                              )
                                ? "Already Attached"
                                : "Attach Tool"}
                            </Button>
                          </motion.div>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-5 w-5" />
                            <AlertTitle>No tool selected</AlertTitle>
                            <AlertDescription>
                              Select a tool from the list to view its
                              configuration
                            </AlertDescription>
                          </Alert>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="attached">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Active Tools</CardTitle>
                    <CardDescription>
                      Currently configured tools for your assistant
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnimatePresence>
                      {attachedTools.length > 0 ? (
                        <motion.div layout className="grid gap-4">
                          {attachedTools.map((tool) => (
                            <motion.div
                              key={tool.name}
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="group relative flex items-center justify-between p-4 rounded-lg border hover:border-primary/20 hover:bg-primary/5 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <Settings className="w-6 h-6" />
                                <div>
                                  <h4 className="font-medium">{tool.name}</h4>
                                  <p className="text-sm text-gray-500">
                                    {tool.description}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTool(tool.name)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <Alert>
                          <AlertCircle className="h-5 w-5" />
                          <AlertTitle>No tools attached</AlertTitle>
                          <AlertDescription>
                            Add tools from the Available Tools tab to get
                            started
                          </AlertDescription>
                        </Alert>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(AssistantToolsManager);

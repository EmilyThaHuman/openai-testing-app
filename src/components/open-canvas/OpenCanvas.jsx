import React, { useEffect, useState, useCallback } from "react";
import { Editor } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { EmptyChat } from "@/components/chat/EmptyChat";
import SystemInstructions from "@/components/chat/SystemInstructions";
import { useToast } from "@/components/ui/use-toast";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft, 
  ChevronRight,
  Bot,
  Check,
  MoreVertical,
  Menu,
  CheckCircle2,
  Save,
  GripVertical,
  Settings2,
  Trash2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStoreShallow } from "@/store/useStore";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRef } from "react";
import { Terminal, Database, Loader2, Badge } from "lucide-react";
import { sendAssistantMessage } from "@/utils/openAIUtils";

if (window.MonacoEnvironment) {
  window.MonacoEnvironment = {
    getWorkerUrl: function(moduleId, label) {
      let basePath = '/monaco-editor/min/vs';
      
      if (label === 'json') {
        return `${basePath}/language/json/json.worker.js`;
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return `${basePath}/language/css/css.worker.js`;
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return `${basePath}/language/html/html.worker.js`;
      }
      if (label === 'typescript' || label === 'javascript') {
        return `${basePath}/language/typescript/ts.worker.js`;
      }
      return `${basePath}/editor/editor.worker.js`;
    }
  };
}

const editorOptions = {
  minimap: { enabled: false },
  fontFamily: "Monaco, Menlo, 'Courier New', monospace",
  fontSize: 14,
  lineNumbers: "on",
  roundedSelection: false,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  theme: "vs-light"
};

export const OpenCanvas = () =>  {
  const store = useStoreShallow();
  // State
  const [content, setContent] = useLocalStorage("editor-content", '// Start coding here');
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [status, setStatus] = useState("idle");
  const [currentToolCall, setCurrentToolCall] = useState(null);
  const [streamedResponse, setStreamedResponse] = useState("");
  const messagesEndRef = useRef(null);
  const { toast } = useToast();
  const scrollRef = useRef(null);
  const [layout, setLayout] = useLocalStorage("panel-layout", {
    chatWidth: 30,
    editorWidth: 70,
  });
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [threadId, setThreadId] = useState(import.meta.env.VITE_OPENAI_THREAD_ID);
  const [assistantId, setAssistantId] = useState(import.meta.env.VITE_OPENAI_ASSISTANT_ID); 

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedResponse]);

  // Handle editor changes
  const handleEditorChange = useCallback(
    (value) => {
      setContent(value);
      setIsSaved(false);
    },
    [setContent]
  );

  // Save content
  const handleSave = useCallback(() => {
    setIsSaved(true);
    // Additional save logic here if needed
  }, []);

  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) return null;
      const fileId = `${file.name}-${Date.now()}`;

      setUploadProgress((prev) => ({
        ...prev,
        [fileId]: 0,
      }));

      try {
        const response = await UnifiedOpenAIService.files.upload(
          file,
          "assistants"
        );
        setUploadedFiles((prev) => [
          ...prev,
          {
            id: response.id,
            name: file.name,
            type: file.type,
            size: file.size,
          },
        ]);

        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been uploaded`,
        });

        return response;
      } catch (error) {
        console.error("File upload error:", error);
        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload file",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  const handleSend = async (messageContent, files) => {
    if ((!messageContent || !messageContent.trim()) && !files.length) return;

    const userMessage = messageContent;
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setStreamedResponse("");

    try {
      const result = await sendAssistantMessage({
        threadId,
        message: userMessage,
        assistantId,
        options: {
          // You can add additional options here
        },
        onStream: (update) => {
          if (update.type === "status") {
            setStatus(update.status);
          } else if (update.type === "tool-call") {
            setCurrentToolCall({
              name: update.toolCall.name,
              args: update.toolCall.args,
              status: "running",
            });
          } else if (update.type === "tool-result") {
            setCurrentToolCall((prev) => ({
              ...prev,
              result: update.toolCall.result,
              status: "completed",
            }));
          }
        },
        onToolCall: async (name, args) => {
          // Implement the actual tool call logic here
          // For now, we can simulate it
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return { result: "Tool execution simulated" };
        },
        onError: (error) => {
          console.error("Error:", error);
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      });

      // Update thread ID if it was created
      if (!threadId) {
        setThreadId(result.threadId);
      }

      // Update messages
      setMessages(result.messages);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setStatus("idle");
      setCurrentToolCall(null);
    }
  };

  // Helper function to extract text from message content
  const getMessageContent = (content) => {
    if (typeof content === "string") {
      return content;
    } else if (Array.isArray(content)) {
      // If content is an array, concatenate text values
      return content
        .map((item) => {
          if (typeof item === "string") {
            return item;
          } else if (item.text && item.text.value) {
            return item.text.value;
          } else {
            return "";
          }
        })
        .join("");
    } else if (typeof content === "object" && content !== null) {
      if (content.text && content.text.value) {
        return content.text.value;
      } else {
        return JSON.stringify(content);
      }
    } else {
      return "";
    }
  };

  const renderToolCall = () => {
    if (!currentToolCall) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-md"
      >
        {currentToolCall.type === "code_interpreter" ? (
          <Terminal className="h-4 w-4" />
        ) : (
          <Database className="h-4 w-4" />
        )}
        <span className="font-mono">
          {currentToolCall.name}(
          {JSON.stringify(currentToolCall.args, null, 2)})
        </span>
        {currentToolCall.status === "running" ? (
          <Loader2 className="h-4 w-4 animate-spin ml-2" />
        ) : (
          <Badge variant="secondary">Done</Badge>
        )}
      </motion.div>
    );
  };

  const renderMessage = (message, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "flex flex-col gap-2 p-4 rounded-lg",
        message.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8"
      )}
    >
      <div className="flex items-center gap-2">
        <Badge variant={message.role === "user" ? "default" : "secondary"}>
          {message.role}
        </Badge>
        {message.role === "assistant" && status === "in_progress" && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {getMessageContent(message.content)}
        </ReactMarkdown>
      </div>
    </motion.div>
  );

  // Handle panel resize
  const handleLayoutChange = useCallback(
    (sizes) => {
      setLayout({
        chatWidth: sizes[0],
        editorWidth: sizes[1],
      });
    },
    [setLayout]
  );

  const menuItems = [
    {
      label: "Save",
      icon: <Save className="w-4 h-4 mr-2" />,
      action: handleSave,
    },
    {
      label: "Share",
      icon: <CheckCircle2 className="w-4 h-4 mr-2" />,
      action: () => {},
    },
    {
      label: "Settings",
      icon: <Menu className="w-4 h-4 mr-2" />,
      action: () => {},
    },
  ];

  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={handleLayoutChange}
        className="h-screen bg-background"
      >
        {/* Chat Panel */}
        <ResizablePanel
          defaultSize={layout.chatWidth}
          minSize={20}
          maxSize={50}
          className="p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col"
          >
            <SystemInstructions
              value={systemPrompt}
              onChange={(newInstructions) => setSystemPrompt(newInstructions)}
            />

            <ScrollArea className="flex-1">
              <div className="space-y-4">
                {messages.map((message, index) => renderMessage(message, index))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="mt-4 border-t border-border pt-4">
              <ChatInput
                onSend={handleSend}
                onFileUpload={handleFileUpload}
                disabled={isLoading}
                placeholder="Send a message or upload files..."
                uploadedFiles={uploadedFiles}
              />
            </div>
          </motion.div>
        </ResizablePanel>

        {/* Resizable Handle */}
        <ResizableHandle>
          <div className="w-2 h-full flex items-center justify-center bg-border hover:bg-primary/20 transition-colors">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </ResizableHandle>

        {/* Editor Panel */}
        <ResizablePanel defaultSize={layout.editorWidth} minSize={30}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full p-4 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-bold">Quick start code</h2>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {isSaved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center text-muted-foreground"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    <span className="text-sm">Saved</span>
                  </motion.div>
                )}

                <TooltipProvider>
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Menu</TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent>
                      {menuItems.map((item, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={item.action}
                          className="flex items-center"
                        >
                          {item.icon}
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              </div>
            </div>

            <Card className="flex-1">
              <CardContent className="p-0 h-full">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  value={content}
                  onChange={handleEditorChange}
                  theme="vs-light"
                  options={editorOptions}
                  beforeMount={(monaco) => {
                    // Optional: Configure Monaco instance before mounting
                    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                      noSemanticValidation: true,
                      noSyntaxValidation: false
                    });
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <AnimatePresence>
        {showQuickSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 right-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Settings</CardTitle>
                <CardDescription>Customize your editor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick settings content */}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {errorMessage && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Card className="p-4 bg-destructive text-destructive-foreground">
            <p>{errorMessage}</p>
          </Card>
        </div>
      )}
    </div>
  );
}

export default OpenCanvas;
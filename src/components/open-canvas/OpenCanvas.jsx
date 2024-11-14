import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { EmptyChat } from '@/components/chat/EmptyChat';
import SystemInstructions from '@/components/chat/SystemInstructions';
import { useToast } from '@/components/ui/use-toast';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Trash2,
  Terminal,
  Database,
  Loader2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useStoreShallow } from '@/store/useStore';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import { lookupTool } from './utils/lookupTool';

const editorOptions = {
  minimap: { enabled: false },
  fontFamily: "Monaco, Menlo, 'Courier New', monospace",
  fontSize: 14,
  lineNumbers: 'on',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  theme: 'vs-light',
};

const OpenCanvas = () => {
  const store = useStoreShallow();
  const [content, setContent] = useLocalStorage('editor-content', '// Start coding here');
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [status, setStatus] = useState('idle');
  const [currentToolCall, setCurrentToolCall] = useState(null);
  const [streamedResponse, setStreamedResponse] = useState('');
  const messagesEndRef = useRef(null);
  const { toast } = useToast();
  const scrollRef = useRef(null);
  const [layout, setLayout] = useLocalStorage('panel-layout', {
    chatWidth: 30,
    editorWidth: 70,
  });
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [threadId, setThreadId] = useState(import.meta.env.VITE_OPENAI_THREAD_ID);
  const [assistantId, setAssistantId] = useState(import.meta.env.VITE_OPENAI_ASSISTANT_ID);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedResponse, scrollToBottom]);

  useEffect(() => {
    const initializeClient = async () => {
      try {
        if (!assistantId) {
          const assistant = await UnifiedOpenAIService.assistants.create({
            name: "OpenCanvas Assistant",
            instructions: "You are a helpful AI assistant that can use various tools and functions to assist users.",
            tools: ["code_interpreter", "retrieval", "function"],
            model: "gpt-4-turbo-preview"
          });
          store.setAssistantId(assistant.id);
          setAssistantId(assistant.id);
        }

        if (!threadId) {
          const thread = await UnifiedOpenAIService.threads.create();
          setThreadId(thread.id);
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
        toast({
          title: 'Initialization Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    };

    initializeClient();
  }, [assistantId, threadId, store, toast]);

  const handleEditorChange = useCallback(value => {
    setContent(value);
    setIsSaved(false);
  }, [setContent]);

  const handleSave = useCallback(() => {
    setIsSaved(true);
    toast({
      title: 'Saved',
      description: 'Content saved successfully',
    });
  }, [toast]);

  const handleFileUpload = useCallback(async file => {
    if (!file) return null;
    const fileId = `${file.name}-${Date.now()}`;

    try {
      const response = await UnifiedOpenAIService.files.upload(file, 'assistants');
      
      setUploadedFiles(prev => [
        ...prev,
        {
          id: response.id,
          name: file.name,
          type: file.type,
          size: file.size,
        },
      ]);

      await UnifiedOpenAIService.assistants.files.attach(assistantId, response.id);

      toast({
        title: 'File uploaded successfully',
        description: `${file.name} has been uploaded and attached to the assistant`,
      });

      return response;
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [assistantId, toast]);

  const handleSend = async (messageContent, files = []) => {
    if ((!messageContent || !messageContent.trim()) && !files.length) return;

    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: messageContent }]);
    setIsLoading(true);
    setStatus('in_progress');

    try {
      // Create message
      await UnifiedOpenAIService.messages.create(threadId, {
        role: 'user',
        content: messageContent,
        file_ids: files.map(f => f.id),
      });

      // Create run
      const run = await UnifiedOpenAIService.runs.create(threadId, {
        assistant_id: assistantId,
      });

      // Stream the response
      const streamResponse = await UnifiedOpenAIService.runs.stream(threadId, run.id, {
        onStream: update => {
          if (update.type === 'status') {
            setStatus(update.status);
          } else if (update.type === 'content') {
            setStreamedResponse(prev => prev + update.content);
          } else if (update.type === 'tool-call') {
            setCurrentToolCall({
              id: update.toolCall.id,
              name: update.toolCall.name,
              args: update.toolCall.args,
              status: 'running',
            });
          }
        },
        onToolCall: async (name, args) => {
          try {
            const result = await lookupTool(name, args);
            setCurrentToolCall(prev => ({
              ...prev,
              status: 'completed',
              result,
            }));
            return result;
          } catch (error) {
            console.error(`Tool execution error (${name}):`, error);
            throw error;
          }
        },
      });

      // Get final messages
      const messages = await UnifiedOpenAIService.messages.list(threadId);
      setMessages(messages);
      setStreamedResponse('');

    } catch (error) {
      console.error('Message handling error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setStatus('idle');
      setCurrentToolCall(null);
    }
  };

  const getMessageContent = content => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .map(item => {
          if (typeof item === 'string') return item;
          if (item.text?.value) return item.text.value;
          return '';
        })
        .join('');
    }
    if (typeof content === 'object' && content !== null) {
      if (content.text?.value) return content.text.value;
      return JSON.stringify(content);
    }
    return '';
  };

  const renderToolCall = () => {
    if (!currentToolCall) return null;

    return (
      <motion.div
        key={currentToolCall.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex flex-col gap-2 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-md"
      >
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span className="font-mono">
            {currentToolCall.name}({JSON.stringify(currentToolCall.args, null, 2)})
          </span>
          {currentToolCall.status === 'running' ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <Badge variant="secondary">Done</Badge>
          )}
        </div>
        {currentToolCall.result && (
          <div className="mt-2 p-2 bg-muted rounded">
            <pre>{JSON.stringify(currentToolCall.result, null, 2)}</pre>
          </div>
        )}
      </motion.div>
    );
  };

  const renderMessage = (message, index) => {
    const content = getMessageContent(message.content);

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx(
          'flex flex-col gap-2 p-4 rounded-lg',
          message.role === 'user'
            ? 'bg-primary/10 ml-8'
            : message.role === 'assistant'
              ? 'bg-muted mr-8'
              : 'bg-secondary/50 mr-8'
        )}
      >
        <div className="flex items-center gap-2">
          <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
            {message.role}
          </Badge>
          {message.role === 'assistant' && status === 'in_progress' && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
        {message.role === 'assistant' && currentToolCall && renderToolCall()}
      </motion.div>
    );
  };

  const handleLayoutChange = useCallback(sizes => {
    setLayout({
      chatWidth: sizes[0],
      editorWidth: sizes[1],
    });
  }, [setLayout]);

  const menuItems = [
    {
      label: 'Save',
      icon: <Save className="w-4 h-4 mr-2" />,
      action: handleSave,
    },
    {
      label: 'Share',
      icon: <CheckCircle2 className="w-4 h-4 mr-2" />,
      action: () => {},
    },
    {
      label: 'Settings',
      icon: <Settings2 className="w-4 h-4 mr-2" />,
      action: () => setShowQuickSettings(true),
    },
  ];

  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={handleLayoutChange}
        className="h-screen bg-background"
      >
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
              onChange={setSystemPrompt}
            />

            <ScrollArea className="flex-1">
              <div className="space-y-4">
                {messages.map((message, index) => renderMessage(message, index))}
                <div ref={messagesEndRef} />
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

        <ResizableHandle>
          <div className="w-2 h-full flex items-center justify-center bg-border hover:bg-primary/20 transition-colors">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </ResizableHandle>

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
                <h2 className="text-lg font-bold">Code Editor</h2>
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
};

export default OpenCanvas;

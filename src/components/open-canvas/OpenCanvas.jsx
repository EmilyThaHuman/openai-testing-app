import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import { Editor } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
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
import PropTypes from 'prop-types';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { markdownComponents } from '../chat/MarkdownComponents';
import FilePreview from '../chat/FilePreview';

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

// -- Parse Messages Utility -- //
function parseMessages(response) {
  return response.data.map(message => {
    const contentText = message.content
      .map(contentItem =>
        contentItem.type === 'text' ? contentItem.text.value : ''
      )
      .join(' ');

    return {
      role: message.role,
      id: message.id,
      content: contentText,
    };
  });
}

// Memoized message component for better performance
const ChatMessage = React.forwardRef(
  ({ message, status, currentToolCall, files }, ref) => {
    const content =
      typeof message.content === 'string'
        ? message.content
        : Array.isArray(message.content)
          ? message.content.map(item => item.text?.value || '').join('')
          : message.content?.text?.value || '';

    const isAssistant = message.role === 'assistant';

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`
        w-full max-w-3xl mx-auto 
        ${isAssistant ? 'ml-0' : 'ml-auto'} 
        mb-6
      `}
        ref={ref}
      >
        <div
          className={`
        flex flex-col gap-3 p-4 rounded-lg
        ${isAssistant ? 'bg-secondary/30 mr-12' : 'bg-primary/10 ml-12'}
      `}
        >
          <div className="flex items-center gap-2">
            <Badge
              variant={isAssistant ? 'secondary' : 'default'}
              className="capitalize"
            >
              {message.role}
            </Badge>
            {isAssistant && status === 'in_progress' && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
              className="text-base leading-relaxed"
            >
              {content}
            </ReactMarkdown>
          </div>

          {files?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {files.map((file, index) => (
                <FilePreview key={index} file={file} />
              ))}
            </div>
          )}

          {message.metadata?.model && (
            <div className="mt-2 text-xs text-muted-foreground">
              Model: {message.metadata.model}
            </div>
          )}

          {isAssistant && currentToolCall && (
            <ToolCallDisplay toolCall={currentToolCall} />
          )}
        </div>
      </motion.div>
    );
  }
);

ChatMessage.displayName = 'ChatMessage';

ChatMessage.propTypes = {
  message: PropTypes.object,
  status: PropTypes.string,
  currentToolCall: PropTypes.object,
  files: PropTypes.array,
};

// Memoized tool call component
const ToolCallDisplay = React.forwardRef(({ toolCall }, ref) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex flex-col gap-2 text-sm bg-background/50 p-3 rounded-md border border-border/50"
      ref={ref}
    >
      <div className="flex items-center gap-2">
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <code className="font-mono text-xs">
          {toolCall.name}({JSON.stringify(toolCall.args, null, 2)})
        </code>
        {toolCall.status === 'running' ? (
          <Loader2 className="h-4 w-4 animate-spin ml-auto" />
        ) : (
          <Badge variant="secondary" className="ml-auto">
            Done
          </Badge>
        )}
      </div>

      {toolCall.result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 p-2 bg-muted rounded-md"
        >
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(toolCall.result, null, 2)}
          </pre>
        </motion.div>
      )}
    </motion.div>
  );
});

ToolCallDisplay.displayName = 'ToolCallDisplay';

ToolCallDisplay.propTypes = {
  toolCall: PropTypes.object,
};

const OpenCanvas = () => {
  const store = useStoreShallow();

  // -- Editor State -- //
  const [content, setContent] = useLocalStorage(
    'editor-content',
    '// Start coding here'
  );
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');

  // -- File State -- //
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // -- Run State -- //
  const [status, setStatus] = useState('idle');
  const [currentToolCall, setCurrentToolCall] = useState(null);
  const [streamedResponse, setStreamedResponse] = useState('');

  // -- Message State -- //
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  // -- Active Part IDs -- //
  const [runId, setRunId] = useState(null);
  const [threadId, setThreadId] = useState(
    import.meta.env.VITE_OPENAI_THREAD_ID
  );
  const [assistantId, setAssistantId] = useState(
    import.meta.env.VITE_OPENAI_ASSISTANT_ID
  );

  // -- UI State -- //
  const messagesEndRef = useRef(null);
  const { toast } = useToast();
  const scrollRef = useRef(null);
  const [layout, setLayout] = useLocalStorage('panel-layout', {
    chatWidth: 30,
    editorWidth: 70,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
            name: 'OpenCanvas Assistant',
            instructions:
              'You are a helpful AI assistant that can use various tools and functions to assist users.',
            tools: ['code_interpreter', 'retrieval', 'function'],
            model: 'gpt-4-turbo-preview',
          });
          store.setAssistantId(assistant.id);
          setAssistantId(assistant.id);
        }

        if (!threadId) {
          const thread = await UnifiedOpenAIService.threads.create();
          setThreadId(thread.id);
        }

        // Load messages from thread if available
        if (threadId) {
          const rawResponse =
            await UnifiedOpenAIService.threads.messages.list(threadId);
          const messages = parseMessages(rawResponse);
          setMessages(messages);
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

  const handleEditorChange = useCallback(
    value => {
      setContent(value);
      setIsSaved(false);
    },
    [setContent]
  );

  const handleSave = useCallback(() => {
    setIsSaved(true);
    toast({
      title: 'Saved',
      description: 'Content saved successfully',
    });
  }, [toast]);

  const handleFileUpload = useCallback(
    async file => {
      if (!file) return null;
      const fileId = `${file.name}-${Date.now()}`;

      try {
        const response = await UnifiedOpenAIService.files.upload(
          file,
          'assistants'
        );

        setUploadedFiles(prev => [
          ...prev,
          {
            id: response.id,
            name: file.name,
            type: file.type,
            size: file.size,
          },
        ]);

        await UnifiedOpenAIService.assistants.files.attach(
          assistantId,
          response.id
        );

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
    },
    [assistantId, toast]
  );

  const handleSend = async (messageContent, files = []) => {
    if ((!messageContent || !messageContent.trim()) && !files.length) return;

    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: messageContent }]);
    setIsLoading(true);
    setStatus('in_progress');

    try {
      // Create message
      await UnifiedOpenAIService.threads.messages.create(threadId, {
        role: 'user',
        content: messageContent,
        file_ids: files.map(f => f.id),
      });

      // Create run
      const runStream = await UnifiedOpenAIService.threads.runs.create(
        threadId,
        {
          assistantId,
          stream: true,
        }
      );

      for await (const event of runStream) {
        setStatus(event.data.status);
        switch (event.data.object) {
          case 'thread.run':
            setRunId(event.data.id);
            console.log('-----------------------------------\n');
            console.log('RUN ID:', event.data.id);
            console.log('RUN STATUS:', event.data.status);
            console.log('-----------------------------------\n');
            if (event.data.status === 'completed') {
              console.log('| RUN METRICS |');
              console.log(
                `[ COMPLETION TOKENS: ${event.data.usage.completion_tokens} |\n
                 | PROMPT TOKENS: ${event.data.usage.prompt_tokens} ]\n
                 | | TOKEN COUNT: ${event.data.usage.total_tokens} ] |\n`
              );
              console.log('-----------------------------------\n');
            }
            break;
          case 'thread.run.step':
            console.log('-----------------------------------\n');
            console.log('RUN STEP:', event.data.id);
            console.log('RUN STEP STATUS:', event.data.status);
            console.log('RUN STEP DETAILS:', event.data.step_details.type);
            if (event.data.status === 'completed') {
              console.log('| RUN STEP METRICS |');
              console.log(
                `[ COMPLETION TOKENS: ${event.data.usage.completion_tokens} |\n
                 | PROMPT TOKENS: ${event.data.usage.prompt_tokens} ]\n
                 | | TOKEN COUNT: ${event.data.usage.total_tokens} ] |\n`
              );
              console.log('-----------------------------------\n');
            }
            break;
          case 'thread.message':
            console.log('-----------------------------------');
            console.log('MESSAGE:', event.data.id);
            console.log('MESSAGE STATUS:', event.data.status);
            if (event.data.status === 'completed') {
              console.log('MESSAGE CONTENT:', event.data.content[0].text.value);
            }
            console.log('-----------------------------------\n');
            break;
          case 'thread.message.delta':
            console.log('-----------------------------------');
            console.log('MESSAGE DELTA:', event.data.id);
            console.log(
              'MESSAGE DELTA CONTENT TYPE:',
              event.data.delta.content[0].type
            );
            if (event.data.delta.content[0].type === 'text') {
              console.log(
                'MESSAGE DELTA CONTENT:',
                event.data.delta.content[0].text.value
              );
              // -- Update the streamed response
              setStreamedResponse(
                prev => prev + event.data.delta.content[0].text.value
              );
            }
            if (event.data.delta.content[0].type === 'image_file') {
              console.log(
                'MESSAGE DELTA CONTENT:',
                event.data.delta.content[0].image_file
              );
              // -- Update the streamed response
              setStreamedResponse(
                prev => prev + event.data.delta.content[0].image_file
              );
            }
            if (event.data.delta.content[0].type === 'tool_call') {
              console.log(
                'MESSAGE DELTA CONTENT:',
                event.data.delta.content[0].tool_call
              );
              // -- Update the current tool call
              setCurrentToolCall(event.data.delta.content[0].tool_call);
            }
            console.log('-----------------------------------\n');
            break;
        }
      }

      // Get final messages
      const runStreamCompletion =
        await UnifiedOpenAIService.threads.runs.retrieve(
          threadId,
          runStream.id
        );
      const finalMessage =
        runStreamCompletion.truncation_strategy.last_messages || [];
      console.log('FINAL MESSAGE:', finalMessage);
      setMessages(prev => [...prev, ...finalMessage]);
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

  const handleLayoutChange = useCallback(
    sizes => {
      setLayout({
        chatWidth: sizes[0],
        editorWidth: sizes[1],
      });
    },
    [setLayout]
  );

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
          className="flex flex-col"
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

            <ScrollArea className="flex-1 px-4">
              <div className="max-w-4xl mx-auto py-4">
                <AnimatePresence mode="popLayout">
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-muted-foreground py-12"
                    >
                      Start a conversation...
                    </motion.div>
                  ) : (
                    messages.map((message, index) => (
                      <ChatMessage
                        key={message.id || index}
                        message={message}
                        status={status}
                        currentToolCall={currentToolCall}
                      />
                    ))
                  )}
                </AnimatePresence>
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

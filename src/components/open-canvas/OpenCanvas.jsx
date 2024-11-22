import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { useStore } from '@/store/useStore';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Key,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatInterface } from './ChatInterface';
import { CodeEditor } from './CodeEditor';
import { FileExplorer } from './FileExplorer';
import { useOpenAI } from '@/hooks/use-openai';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const panelVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

export function OpenCanvas() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { apiKey: contextApiKey, initialize: initializeContext } = useOpenAI();

  // Split into smaller selectors for better performance
  const {
    files,
    currentFile,
    isFileExplorerOpen,
    loading,
    error,
    initializeWorkspace,
    apiKey: storeApiKey,
    isInitialized,
    initialize,
    resetOpenCanvas,
    toggleFileExplorer,
    setFiles,
    setCurrentFile,
    fetchAssistants,
    setSelectedAssistant,
    setSelectedThread,
    assistants,
    selectedAssistant,
    selectedThread,
  } = useStore(state => ({
    files: state.files,
    currentFile: state.currentFile,
    isFileExplorerOpen: state.isFileExplorerOpen,
    loading: state.loading,
    error: state.error,
    initializeWorkspace: state.initializeWorkspace,
    apiKey: state.apiKey,
    isInitialized: state.isInitialized,
    initialize: state.initialize,
    resetOpenCanvas: state.resetOpenCanvas,
    toggleFileExplorer: state.toggleFileExplorer,
    setFiles: state.setFiles,
    setCurrentFile: state.setCurrentFile,
    fetchAssistants: state.fetchAssistants,
    setSelectedAssistant: state.setSelectedAssistant,
    setSelectedThread: state.setSelectedThread,
    assistants: state.assistants || [],
    selectedAssistant: state.selectedAssistant,
    selectedThread: state.selectedThread,
  }));

  // Track initialization state
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isOpenAIReady, setIsOpenAIReady] = useState(false);
  const [threadId, setThreadId] = useState(
    import.meta.env.VITE_OPENAI_THREAD_ID
  );
  const [assistantId, setAssistantId] = useState(
    import.meta.env.VITE_OPENAI_ASSISTANT_ID
  );
  // Initialize OpenAI
  const initializeOpenAI = useCallback(async () => {
    const key = contextApiKey || storeApiKey;
    if (!key) return false;

    try {
      // Initialize in context
      await initializeContext(key);

      // Initialize in service
      UnifiedOpenAIService.initialize(key);

      // Initialize in store if needed
      if (!isInitialized) {
        await initialize(key);
      }

      setIsOpenAIReady(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize OpenAI:', error);
      toast({
        title: 'OpenAI Initialization Failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [
    contextApiKey,
    storeApiKey,
    initializeContext,
    initialize,
    isInitialized,
    toast,
  ]);

  // Initialization effect with cleanup
  useEffect(() => {
    let mounted = true;
    let threadCheckInterval;

    const init = async () => {
      if (!contextApiKey && !storeApiKey) {
        navigate('/account/settings');
        return;
      }

      if (hasInitialized) return;

      try {
        // Ensure OpenAI is initialized first
        const openAIInitialized = await initializeOpenAI();
        if (!openAIInitialized || !mounted) return;

        if (mounted && (!files || files.length === 0)) {
          await initializeWorkspace();
        }

        if (mounted && (!selectedAssistant || !selectedThread)) {
          if (!assistants?.length) {
            try {
              const fetchedAssistants = await fetchAssistants();
              if (assistantId && mounted && Array.isArray(fetchedAssistants)) {
                const assistant = fetchedAssistants.find(
                  a => a.id === assistantId
                );
                if (assistant) {
                  console.log('ASST', assistant);
                  setSelectedAssistant(assistant);
                }
              }
            } catch (error) {
              console.error('Failed to fetch assistants:', error);
              if (mounted) {
                toast({
                  title: 'Error',
                  description:
                    'Failed to fetch assistants. Please check your API key.',
                  variant: 'destructive',
                });
              }
            }
          }

          // Only fetch thread once
          if (threadId && !selectedThread && mounted) {
            try {
              const thread =
                await UnifiedOpenAIService.threads.retrieve(threadId);
              setSelectedThread(thread);
              setHasInitialized(true);
            } catch (error) {
              console.warn('Failed to fetch thread:', error);
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
        if (mounted) {
          toast({
            title: 'Initialization Error',
            description: error.message || 'Failed to initialize workspace',
            variant: 'destructive',
          });
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (threadCheckInterval) {
        clearInterval(threadCheckInterval);
      }
      resetOpenCanvas?.();
    };
  }, [
    contextApiKey,
    storeApiKey,
    isInitialized,
    files,
    initialize,
    initializeWorkspace,
    resetOpenCanvas,
    fetchAssistants,
    setSelectedAssistant,
    setSelectedThread,
    assistants,
    selectedAssistant,
    selectedThread,
    hasInitialized,
    toast,
    navigate,
    initializeOpenAI,
    threadId,
    assistantId,
  ]);

  // Show API key required message
  if (!contextApiKey && !storeApiKey) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-full gap-4"
      >
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            Please set your OpenAI API key in settings to use this feature.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/account/settings')} className="gap-2">
          <Key className="w-4 h-4" />
          Go to Settings
        </Button>
      </motion.div>
    );
  }

  // Show loading state
  if (loading || !isOpenAIReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-4rem)] relative w-full max-w-[2000px] mx-auto"
      style={{ position: 'relative' }}
    >
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 z-50 md:hidden"
        onClick={toggleFileExplorer}
      >
        {isFileExplorerOpen ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeftOpen className="h-4 w-4" />
        )}
      </Button>

      <ResizablePanelGroup
        direction="horizontal"
        className="h-full rounded-lg border bg-background"
      >
        <ResizablePanel
          defaultSize={30}
          minSize={25}
          maxSize={40}
          className={cn('transition-all duration-300', 'hidden md:block')}
        >
          <motion.div variants={panelVariants} className="h-full">
            <ChatInterface />
          </motion.div>
        </ResizablePanel>

        <ResizableHandle withHandle className="hidden md:block" />

        <ResizablePanel defaultSize={70}>
          <motion.div variants={panelVariants} className="h-full flex flex-col">
            <AnimatePresence mode="wait">
              {isFileExplorerOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 300, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-b"
                >
                  <FileExplorer />
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className={cn(
                'flex-1 transition-all duration-200',
                isFileExplorerOpen ? 'h-[calc(100%-300px)]' : 'h-full'
              )}
            >
              {currentFile ? (
                <CodeEditor key={currentFile.id} />
              ) : (
                <EmptyState />
              )}
            </div>
          </motion.div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Mobile Chat Interface */}
      <div className="fixed inset-x-0 bottom-0 md:hidden">
        <AnimatePresence>
          {!isFileExplorerOpen && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-background border-t shadow-lg"
            >
              <ChatInterface />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const EmptyState = memo(function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex items-center justify-center p-8 text-center"
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">No File Selected</h3>
        <p className="text-sm text-muted-foreground">
          Select a file from the explorer or create a new one to get started.
        </p>
      </div>
    </motion.div>
  );
});

export default memo(OpenCanvas);

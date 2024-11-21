import React, { useEffect, useCallback, useMemo } from 'react';
import { useStoreSelector } from '@/store/useStore';
import { useOpenAI } from '@/context/OpenAIContext';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { FileExplorer } from './FileExplorer';
import { CodeEditor } from './CodeEditor';
import { ChatInterface } from './ChatInterface';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getDefaultFiles } from '@/lib/utils/defaultFiles';

export function OpenCanvas() {
  const { apiKey, isInitialized, initialize } = useOpenAI();
  
  // Memoize selector function to prevent unnecessary updates
  const selector = useMemo(() => state => ({
    files: state.files,
    currentFile: state.currentFile,
    loading: state.loading,
    error: state.error,
    isFileExplorerOpen: state.isFileExplorerOpen,
    initializeWorkspace: state.initializeWorkspace,
    resetOpenCanvas: state.resetOpenCanvas
  }), []);

  const store = useStoreSelector(selector);

  // Initialize workspace once
  useEffect(() => {
    const init = async () => {
      if (!apiKey || store.files.length > 0) return;

      try {
        if (!isInitialized) {
          await initialize(apiKey);
        }

        const defaultFiles = getDefaultFiles();
        await store.initializeWorkspace(defaultFiles);
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };

    init();

    // Cleanup
    return () => {
      store.resetOpenCanvas();
    };
  }, [apiKey, isInitialized]);

  if (!apiKey) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>API Key Required</AlertTitle>
        <AlertDescription>
          Please add your OpenAI API key in settings to use this feature.
        </AlertDescription>
      </Alert>
    );
  }

  if (store.loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (store.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{store.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ResizablePanelGroup direction="horizontal">
        {/* Chat Interface - Left Panel */}
        <ResizablePanel 
          defaultSize={30} 
          minSize={25}
          maxSize={40}
        >
          <ChatInterface />
        </ResizablePanel>

        {/* Resize Handle */}
        <ResizableHandle withHandle />

        {/* Main Content Area - Right Panel */}
        <ResizablePanel defaultSize={70}>
          <div className="h-full flex flex-col">
            {store.isFileExplorerOpen && (
              <div className="h-[300px] border-b">
                <FileExplorer />
              </div>
            )}
            <div className="flex-1">
              <CodeEditor />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default OpenCanvas;

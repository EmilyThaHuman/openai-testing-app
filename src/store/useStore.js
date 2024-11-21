import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useCallback, useMemo } from 'react';
import { createJSONStorage } from 'zustand/middleware';
import { createBillingSlice } from './slices/billingSlice';
import { createOpenAISlice } from './slices/openaiSlice';
import { createVectorStoreSlice } from './slices/vectorStoreSlice';
import { createMetricsSlice } from './slices/metricsSlice';
import { createWorkspaceSlice } from './slices/workspaceSlice';
import { createChatSlice } from './slices/chatSlice';
import { createUISlice } from './slices/uiSlice';
import { createAISettingsSlice } from './slices/aiSettingsSlice';
import { createOpenCanvasSlice } from './slices/openCanvasSlice';
import { createAssistantSlice } from './slices/assistantSlice';
import { createAssistantTestingSlice } from './slices/assistantTestingSlice';
import { performanceMiddleware } from './middleware/performanceMiddleware';
import { createUserSlice } from './slices/userSlice';
import { createToolsSlice } from './slices/toolsSlice';

// Create the root store with all slices and middleware
const store = createWithEqualityFn(
  subscribeWithSelector(
    persist(
      devtools(
        immer(
          performanceMiddleware((set, get) => ({
            // Combine all slices
            ...createBillingSlice(set, get),
            ...createOpenAISlice(set, get),
            ...createVectorStoreSlice(set, get),
            ...createMetricsSlice(set, get),
            ...createWorkspaceSlice(set, get),
            ...createChatSlice(set, get),
            ...createUISlice(set, get),
            ...createAISettingsSlice(set, get),
            ...createOpenCanvasSlice(set, get),
            ...createAssistantSlice(set, get),
            ...createAssistantTestingSlice(set, get),
            ...createUserSlice(set, get),
            ...createToolsSlice(set, get),

            // Reset all state
            resetStore: () => {
              set({}, true); // Deep reset of all state
              get().resetBillingState();
              get().resetOpenAIState();
              get().resetVectorStoreState();
              get().resetMetricsState();
              get().resetWorkspaceState();
              get().resetChatState();
              get().resetUIState();
              get().resetAISettingsState();
              get().resetOpenCanvasState();
              get().resetAssistantState();
              get().resetAssistantTestingState();
              get().resetUserState();
              get().resetToolsState();
            },
          }))
        )
      ),
      {
        name: 'app-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: state => ({
          // Only persist necessary state
          theme: state.theme,
          settings: state.settings,
          aiSettings: state.aiSettings,
          apiKey: state.apiKey,
          // chat
          activeChat: state.activeChat,
          // assistants
          assistants: state.assistants,
          // open canvas
          currentFile: state.currentFile,
          // workspace
          files: state.files,
          // user
          user: state.user,
        }),
      }
    )
  )
);

export const useStore = store;

// Optimized selector hook
export const useStoreSelector = (selectorFn, equalityFn = shallow) => {
  // Wrap selector in useCallback instead of useMemo for function stability
  const stableSelector = useCallback(selectorFn, []);

  // Use stable selector with equality function
  return useStore(stableSelector, equalityFn);
};

export const useStoreShallow = selector => useStore(selector, shallow);

// Create stable selector hooks
const createSelector = selectorFn => state => {
  const selectedState = selectorFn(state);
  // Return a stable reference if the values haven't changed
  return useMemo(
    () => selectedState,
    [
      // Spread all values from selectedState as dependencies
      ...Object.values(selectedState),
    ]
  );
};

// Example of a stable selector
export const useBillingState = createSelector(state => ({
  usage: state.usage,
  currentPlan: state.currentPlan,
  timeRange: state.timeRange,
  isLoadingBilling: state.isLoadingBilling,
  billingError: state.billingError,
  setTimeRange: state.setTimeRange,
  fetchBillingDetails: state.fetchBillingDetails,
  resetBillingState: state.resetBillingState,
}));

export const useOpenAIState = createSelector(state => ({
  apiKey: state.apiKey,
  isInitialized: state.isInitialized,
  error: state.error,
  initialize: state.initialize,
  setApiKey: state.setApiKey,
  resetOpenAIState: state.resetOpenAIState,
}));

export const useVectorStoreState = createSelector(state => ({
  vectorStores: state.vectorStores,
  selectedVectorStore: state.selectedVectorStore,
  loading: state.loading,
  error: state.error,
  createVectorStore: state.createVectorStore,
  selectVectorStore: state.selectVectorStore,
  deleteVectorStore: state.deleteVectorStore,
  resetVectorStoreState: state.resetVectorStoreState,
}));

export const useMetricsState = createSelector(state => ({
  metrics: state.metrics,
  isLoadingMetrics: state.isLoadingMetrics,
  metricsError: state.metricsError,
  fetchMetrics: state.fetchMetrics,
  resetMetricsState: state.resetMetricsState,
}));

export const useWorkspaceState = createSelector(state => ({
  files: state.files,
  currentFile: state.currentFile,
  isFileExplorerOpen: state.isFileExplorerOpen,
  loading: state.loading,
  error: state.error,
  initializeWorkspace: state.initializeWorkspace,
  setCurrentFile: state.setCurrentFile,
  toggleFileExplorer: state.toggleFileExplorer,
  resetWorkspaceState: state.resetWorkspaceState,
}));

export const useChatState = createSelector(state => ({
  chats: state.chats,
  activeChat: state.activeChat,
  messages: state.messages,
  isStreaming: state.isStreaming,
  createChat: state.createChat,
  setActiveChat: state.setActiveChat,
  sendMessage: state.sendMessage,
  resetChatState: state.resetChatState,
}));

export const useUIState = createSelector(state => ({
  theme: state.theme,
  settings: state.settings,
  isSettingsOpen: state.isSettingsOpen,
  setTheme: state.setTheme,
  updateSettings: state.updateSettings,
  toggleSettings: state.toggleSettings,
  resetUIState: state.resetUIState,
}));

// Export a hook for global loading state
export const useGlobalLoading = createSelector(state => ({
  isLoading:
    state.isLoadingBilling ||
    state.loading ||
    state.isLoadingMetrics ||
    state.isStreaming,
}));

// Export a hook for global error state
export const useGlobalError = createSelector(state => ({
  hasError: state.billingError || state.error || state.metricsError,
  errors: {
    billing: state.billingError,
    openai: state.error,
    metrics: state.metricsError,
  },
}));

// Add AssistantTesting selector
export const useAssistantTestingState = createSelector(state => ({
  activeTab: state.activeTab,
  assistantFormMode: state.assistantFormMode,
  isEditing: state.isEditing,
  newAssistant: state.newAssistant,
  newMessage: state.newMessage,
  chatOpen: state.chatOpen,
  isFileDialogOpen: state.isFileDialogOpen,
  uploadingFiles: state.uploadingFiles,
  uploading: state.uploading,
  error: state.error,
  setActiveTab: state.setActiveTab,
  setAssistantFormMode: state.setAssistantFormMode,
  setIsEditing: state.setIsEditing,
  setNewAssistant: state.setNewAssistant,
  setNewMessage: state.setNewMessage,
  setChatOpen: state.setChatOpen,
  setIsFileDialogOpen: state.setIsFileDialogOpen,
  setUploadingFiles: state.setUploadingFiles,
  setUploading: state.setUploading,
  setError: state.setError,
  handleStartEdit: state.handleStartEdit,
  handleStartRun: state.handleStartRun,
  handleChatMessage: state.handleChatMessage,
  handleFileUpload: state.handleFileUpload,
  resetAssistantTestingState: state.resetAssistantTestingState,
}));

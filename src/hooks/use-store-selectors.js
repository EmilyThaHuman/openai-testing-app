import { shallow } from 'zustand/shallow';
import { useCallback } from 'react';
import { useStoreSelector } from '@/store/useStore';

// Billing selector hook
export const useBillingState = () => {
  return useStoreSelector(
    useCallback(
      (state) => ({
        usage: state.usage,
        currentPlan: state.currentPlan,
        timeRange: state.timeRange,
        isLoadingBilling: state.isLoadingBilling,
        billingError: state.billingError,
        fetchBillingDetails: state.fetchBillingDetails,
        setTimeRange: state.setTimeRange,
        clearBillingError: state.clearBillingError
      }),
      []
    ),
    shallow
  );
};

// Optimized selector hook for OpenCanvas
export const useOpenCanvasState = () => {
  return useStoreSelector(
    useCallback(
      (state) => ({
        files: state.files,
        currentFile: state.currentFile,
        loading: state.loading,
        error: state.error,
        isFileExplorerOpen: state.isFileExplorerOpen,
        initializeWorkspace: state.initializeWorkspace,
        resetOpenCanvas: state.resetOpenCanvas,
        apiKey: state.apiKey,
        isInitialized: state.isInitialized
      }),
      []
    ),
    shallow
  );
};

// Optimized selector hook for chat state
export const useChatState = () => {
  return useStoreSelector(
    useCallback(
      (state) => ({
        messages: state.messages,
        isLoading: state.isLoading,
        sendMessage: state.sendMessage,
        // ... other chat related state
      }),
      []
    ),
    shallow
  );
};

// Add other optimized selectors as needed 
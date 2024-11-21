import { create } from 'zustand';
import { createOpenCanvasChatSlice } from './slices/openCanvasChatSlice';
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createChatSlice } from "./slices/chatSlice";
import { createAssistantSlice } from "./slices/assistantSlice";
import { createFileSlice } from "./slices/fileSlice";
import { createUserSlice } from "./slices/userSlice";
import { createVectorStoreSlice } from "./slices/vectorStoreSlice";
import { createToolsSlice } from "./slices/toolsSlice";
import { createOpenAISlice } from "./slices/openaiSlice";
import { createUISlice } from "./slices/uiSlice";
import { createSettingsSlice } from "./slices/settingsSlice";
import { createBillingSlice } from "./slices/billingSlice";
import { createMetricsSlice } from "./slices/metricsSlice";
import { createNotificationsSlice } from "./slices/notificationsSlice";
import { createOpenCanvasSlice } from "./slices/openCanvasSlice";
import { performanceMiddleware } from "./middleware/performanceMiddleware";

// Store version for migrations
const STORE_VERSION = 1;

// Store configuration
const STORE_CONFIG = {
  name: "app-storage",
  version: STORE_VERSION,
  migrate: (persistedState, version) => {
    if (version === 0) {
      // Add migration logic here
      return {
        ...persistedState,
        // Add new state properties or transform existing ones
      };
    }
    return persistedState;
  },
};

// Create base store
const createStore = (...args) => ({
  // Core functionality
  ...createOpenAISlice(...args),
  ...createChatSlice(...args),
  ...createAssistantSlice(...args),
  
  // File and canvas management
  ...createFileSlice(...args),
  ...createOpenCanvasSlice(...args),
  
  // User and settings
  ...createUserSlice(...args),
  ...createSettingsSlice(...args),
  ...createUISlice(...args),
  
  // Features
  ...createVectorStoreSlice(...args),
  ...createToolsSlice(...args),
  ...createBillingSlice(...args),
  ...createMetricsSlice(...args),
  ...createNotificationsSlice(...args),

  // Computed selectors
  getAllChats: () => {
    const state = args[1]();
    return [...state.chats, ...state.assistantChats]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getActiveChat: () => {
    const state = args[1]();
    return state.activeChat || state.activeAssistantChat;
  },

  // Utility functions
  resetStore: () => {
    args[0]((state) => {
      Object.keys(state).forEach(key => {
        if (typeof state[key] === 'object') {
          state[key] = {};
        }
      });
    });
  },

  // Debug helpers
  getStoreState: () => args[1](),
  
  logStoreAction: (action, data) => {
    console.debug('[Store Action]', action, data);
  }
});

// Create store with middleware
export const useStore = create((set, get) => ({
  ...createOpenCanvasChatSlice(set, get),
  ...createWithEqualityFn(
    persist(
      devtools(
        immer(
          performanceMiddleware(createStore)
        )
      ),
      {
        name: STORE_CONFIG.name,
        version: STORE_CONFIG.version,
        migrate: STORE_CONFIG.migrate,
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          settings: state.settings,
          theme: state.theme,
          chats: state.chats,
          files: state.files,
          notifications: state.notifications,
          assistants: state.assistants,
          vectorStores: state.vectorStores,
          billing: {
            usage: state.usage,
            currentPlan: state.currentPlan
          }
        })
      }
    ),
    shallow
  )
}));

// Create selector hooks
export const createSelector = (selector) => (state) => selector(state);

// Export selector hooks
export const useStoreSelector = useStore;

// Export typed selectors
export const useUserState = () => useStoreSelector(state => ({
  user: state.user,
  isAuthenticated: !!state.user,
  updateProfile: state.updateUserProfile
}));

export const useUIState = () => useStoreSelector(state => ({
  theme: state.theme,
  sidebarOpen: state.sidebarOpen,
  toggleSidebar: state.toggleSidebar
}));

export const useFileState = () => useStoreSelector(state => ({
  currentFile: state.currentFile,
  files: state.files,
  createFile: state.createNewFile,
  saveFile: state.saveCurrentFile,
  deleteFile: state.deleteFile
}));

export const useChatState = () => useStoreSelector(state => ({
  chats: state.chats,
  activeChat: state.getActiveChat(),
  sendMessage: state.sendChatMessage
}));

// Export store instance
export const store = useStore;

// Subscribe to store changes in development
if (process.env.NODE_ENV === 'development') {
  useStore.subscribe(
    state => state,
    (state) => console.debug('[Store Updated]', state)
  );
}

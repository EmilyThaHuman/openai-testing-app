export const createUISlice = (set) => ({
  theme: 'system',
  sidebarOpen: true,
  modals: {
    settings: false,
    shortcuts: false,
    profile: false,
  },
  toasts: [],
  
  setTheme: (theme) => set({ theme }),
  
  toggleSidebar: () => 
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  toggleModal: (modalName) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: !state.modals[modalName],
      },
    })),
    
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now(), ...toast }],
    })),
    
  removeToast: (toastId) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== toastId),
    })),
}); 
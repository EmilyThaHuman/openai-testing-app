export const createUserSlice = (set, get) => ({
  // -- main --
  user: null,
  accessToken: null,
  username: '',
  displayname: '',
  avatar: '',
  profileContext: '',
  // -- display preferences --
  theme: 'dark',
  // -- account data --
  subscribed: false,
  // -- --
  isLoading: false,
  error: null,
  commandPaletteOpen: false,
  sidebarOpen: true,

  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),  
  setUserProfileContext: (profileContext) => set({ profileContext }), 
  setUsername: (username) => set({ username }),   
  setDisplayname: (displayname) => set({ displayname }),
  setAvatar: (avatar) => set({ avatar }),
  setTheme: (theme) => set({ theme }),  
  setSubscribed: (subscribed) => set({ subscribed }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  toggleCommandPalette: () => set((state) => ({ 
    commandPaletteOpen: !state.commandPaletteOpen 
  })),
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
}) 
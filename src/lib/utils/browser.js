// Helper to safely check if we're in a browser environment
const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined'

// Mock file system for non-browser environments
const mockFs = {
  readFile: () => Promise.reject(new Error('File system not available')),
  writeFile: () => Promise.reject(new Error('File system not available'))
}

// Mock window object for non-browser environments
const mockWindow = {
  fs: mockFs,
  document: {
    createElement: () => ({}),
    body: {},
    documentElement: {}
  },
  navigator: {
    userAgent: '',
    language: 'en-US',
    platform: '',
    connection: null
  },
  location: {
    href: '',
    origin: '',
    protocol: 'https:',
    host: '',
    hostname: '',
    port: '',
    pathname: '',
    search: '',
    hash: ''
  }
}

// Create getters to ensure proper initialization order
const getBrowserObject = (key) => {
  if (isBrowser()) {
    return globalThis[key]
  }
  return mockWindow[key]
}

// Export safe browser APIs using getters
export const getWindow = () => getBrowserObject('window')
export const getDocument = () => getBrowserObject('document')
export const getNavigator = () => getBrowserObject('navigator')
export const getLocation = () => getBrowserObject('location')

// Export utility functions
export const getWindowDimensions = () => ({
  width: isBrowser() ? getWindow().innerWidth : 0,
  height: isBrowser() ? getWindow().innerHeight : 0
})

export const isClient = isBrowser()

// Export default object with getters
export default {
  get window() { return getWindow() },
  get document() { return getDocument() },
  get navigator() { return getNavigator() },
  get location() { return getLocation() },
  isClient,
  getWindowDimensions
} 
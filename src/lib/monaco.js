import { loader } from '@monaco-editor/react'

// Configure Monaco Editor
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs'
  },
  'vs/nls': {
    availableLanguages: { '*': 'en' }
  }
}) 
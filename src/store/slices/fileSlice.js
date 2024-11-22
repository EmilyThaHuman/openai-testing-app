import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService'
import { toast } from '@/components/ui/use-toast'

export const createFileSlice = (set, get) => ({
  // State
  files: [],
  uploadedFiles: [],
  uploadProgress: {},
  isUploading: false,
  error: null,
  
  // Basic setters
  setFiles: (files) => set({ files }),
  addFile: (file) => set((state) => ({ 
    files: [...state.files, file] 
  })),
  removeFile: (fileId) => set((state) => ({ 
    files: state.files.filter(f => f.id !== fileId) 
  })),
  
  setUploadProgress: (fileId, progress) => set((state) => ({
    uploadProgress: {
      ...state.uploadProgress,
      [fileId]: progress
    }
  })),
  
  clearUploadProgress: (fileId) => set((state) => {
    const newProgress = { ...state.uploadProgress }
    delete newProgress[fileId]
    return { uploadProgress: newProgress }
  }),

  // Upload file to OpenAI and attach to assistant
  uploadFile: async (file, assistantId) => {
    const state = get()
    if (!file) return null

    try {
      set({ isUploading: true })

      // Upload file to OpenAI
      const response = await UnifiedOpenAIService.files.upload(
        file,
        'assistants'
      )

      // Update uploaded files list
      set((state) => ({
        uploadedFiles: [
          ...state.uploadedFiles,
          {
            id: response.id,
            name: file.name,
            type: file.type,
            size: file.size,
          }
        ]
      }))

      // Attach file to assistant if ID provided
      if (assistantId) {
        await UnifiedOpenAIService.assistants.files.attach(
          assistantId,
          response.id
        )
      }

      toast({
        title: 'File uploaded successfully',
        description: `${file.name} has been uploaded${assistantId ? ' and attached to the assistant' : ''}`
      })

      return response

    } catch (error) {
      console.error('File upload error:', error)
      set({ error: error.message })
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive'
      })
      return null
    } finally {
      set({ isUploading: false })
    }
  },

  // Remove file from OpenAI and detach from assistant
  removeUploadedFile: async (fileId, assistantId) => {
    try {
      // Detach from assistant if ID provided
      if (assistantId) {
        await UnifiedOpenAIService.assistants.files.detach(
          assistantId,
          fileId
        )
      }

      // Delete file from OpenAI
      await UnifiedOpenAIService.files.delete(fileId)

      // Update state
      set((state) => ({
        uploadedFiles: state.uploadedFiles.filter(f => f.id !== fileId)
      }))

      toast({
        title: 'File removed successfully',
        description: 'The file has been removed and detached'
      })

    } catch (error) {
      console.error('File removal error:', error)
      set({ error: error.message })
      toast({
        title: 'Removal failed',
        description: error.message,
        variant: 'destructive'
      })
    }
  },

  // Reset state
  resetFileState: () => set({
    files: [],
    uploadedFiles: [],
    uploadProgress: {},
    isUploading: false,
    error: null
  })
})

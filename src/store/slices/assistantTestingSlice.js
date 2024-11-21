import { toast } from "@/components/ui/use-toast"
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService"

export const DEFAULT_ASSISTANT = {
  name: "",
  instructions: "",
  model: "gpt-4-turbo-preview",
  metadata: {},
  temperature: 0.7,
  top_p: 1,
  presence_penalty: 0,
  frequency_penalty: 0,
  response_format: { type: "text" },
  file_ids: [],
  file_search_enabled: false,
  code_interpreter_enabled: false,
  tools: [],
  function_calling_enabled: false,
  streaming: false,
}

export const createAssistantTestingSlice = (set, get) => ({
  // State
  activeTab: 'assistants',
  assistantFormMode: 'create',
  isEditing: false,
  newAssistant: DEFAULT_ASSISTANT,
  newMessage: '',
  chatOpen: false,
  isFileDialogOpen: false,
  uploadingFiles: new Map(),
  uploading: false,
  error: null,

  // Setters
  setActiveTab: (tab) => set({ activeTab: tab }),
  setAssistantFormMode: (mode) => set({ assistantFormMode: mode }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setNewAssistant: (assistant) => set({ newAssistant: assistant }),
  setNewMessage: (message) => set({ newMessage: message }),
  setChatOpen: (open) => set({ chatOpen: open }),
  setIsFileDialogOpen: (open) => set({ isFileDialogOpen: open }),
  setUploadingFiles: (files) => set({ uploadingFiles: files }),
  setUploading: (uploading) => set({ uploading }),
  setError: (error) => set({ error }),

  // Actions
  handleStartEdit: (assistant) => {
    set({
      selectedAssistant: assistant,
      assistantFormMode: 'edit',
      isEditing: true,
      activeTab: 'create'
    })
  },

  handleStartRun: async (assistant) => {
    const state = get()
    try {
      const { run, thread, messages } = await state.startNewRun(
        assistant.id,
        "Initial message"
      )
      set({ 
        assistantChatMessages: messages,
        chatOpen: true 
      })
      return { run, thread, messages }
    } catch (error) {
      set({ error })
      toast({
        title: 'Error',
        description: error.message || 'Failed to start run',
        variant: 'destructive'
      })
      throw error
    }
  },

  handleChatMessage: async (message, fileIds = []) => {
    const state = get()
    if (!state.currentThread?.id || !state.selectedAssistant?.id) {
      throw new Error("No active conversation")
    }
    if (!message.trim()) return

    try {
      const { run, thread, messages } = await state.submitMessage(message)
      set({
        selectedThread: thread,
        assistantChatMessages: messages
      })
      return run
    } catch (error) {
      set({ error })
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      })
      throw error
    }
  },

  handleFileUpload: async (filesInput) => {
    const state = get()
    const files = Array.isArray(filesInput) ? filesInput : [filesInput]

    try {
      set({ uploading: true })
      set({ 
        uploadingFiles: new Map(
          files.map((file) => [file.name, { progress: 0, status: "pending" }])
        )
      })

      const results = await Promise.all(files.map(async (file) => {
        try {
          set(state => ({
            uploadingFiles: new Map(state.uploadingFiles).set(file.name, {
              progress: 0,
              status: "uploading"
            })
          }))

          const openAIFile = await state.uploadFile(file)

          if (state.selectedAssistant?.id) {
            await state.attachFileToAssistant(state.selectedAssistant.id, openAIFile.id)
          }

          set(state => ({
            uploadingFiles: new Map(state.uploadingFiles).set(file.name, {
              progress: 100,
              status: "complete"
            })
          }))

          return { success: true, file: openAIFile }
        } catch (error) {
          set(state => ({
            uploadingFiles: new Map(state.uploadingFiles).set(file.name, {
              progress: 0,
              status: "error",
              error: error.message
            })
          }))
          return { success: false, error, fileName: file.name }
        }
      }))

      const successfulUploads = results.filter(r => r.success)
      if (state.selectedAssistant?.id && successfulUploads.length > 0) {
        await state.refreshAssistant(state.selectedAssistant.id)
      }

      return successfulUploads.map(r => r.file)
    } catch (error) {
      set({ error })
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload files',
        variant: 'destructive'
      })
      throw error
    } finally {
      set({ uploading: false })
      setTimeout(() => set({ uploadingFiles: new Map() }), 2000)
    }
  },

  // Reset state
  resetAssistantTestingState: () => {
    set({
      activeTab: 'assistants',
      assistantFormMode: 'create',
      isEditing: false,
      newAssistant: DEFAULT_ASSISTANT,
      newMessage: '',
      chatOpen: false,
      isFileDialogOpen: false,
      uploadingFiles: new Map(),
      uploading: false,
      error: null
    })
  }
}) 
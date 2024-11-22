import { useCallback } from 'react'
import { useStoreSelector } from '@/store/useStore'
import { useCrudOperations } from './common/useCrudOperations'

// Separate selectors for better performance
const useAssistantState = () => useStoreSelector(state => ({
  assistants: state.assistants,
  selectedAssistant: state.selectedAssistant,
  threads: state.threads,
  threadMessages: state.threadMessages,
  expandedThreads: state.expandedThreads,
  loading: state.loading,
  error: state.error
}))

const useAssistantSetters = () => useStoreSelector(state => ({
  setSelectedAssistant: state.setSelectedAssistant,
  setThreads: state.setThreads,
  setThreadMessages: state.setThreadMessages,
  setExpandedThreads: state.setExpandedThreads
}))

const useAssistantActions = () => useStoreSelector(state => ({
  fetchAssistants: state.fetchAssistants,
  fetchThreadsForAssistant: state.fetchThreadsForAssistant,
  createAssistant: state.createAssistant,
  updateAssistant: state.updateAssistant,
  deleteAssistant: state.deleteAssistant,
  createThread: state.createThread,
  deleteThread: state.deleteThread,
  sendMessage: state.sendMessage,
  regenerate: state.regenerate,
  submitFeedback: state.submitFeedback
}))

export function useAssistants() {
  const state = useAssistantState()
  const setters = useAssistantSetters()
  const actions = useAssistantActions()

  // Create CRUD operations for assistants
  const assistantOperations = useCrudOperations('Assistant', {
    create: actions.createAssistant,
    update: actions.updateAssistant,
    delete: actions.deleteAssistant
  })

  // Create CRUD operations for messages
  const messageOperations = useCrudOperations('Message', {
    send: actions.sendMessage,
    regenerate: actions.regenerate,
    submit: actions.submitFeedback
  })

  // Create CRUD operations for threads
  const threadOperations = useCrudOperations('Thread', {
    create: actions.createThread,
    delete: actions.deleteThread
  })

  return {
    // State
    ...state,
    
    // Setters
    ...setters,
    
    // Fetch operations
    fetchAssistants: actions.fetchAssistants,
    fetchThreadsForAssistant: actions.fetchThreadsForAssistant,
    
    // Assistant operations
    createAssistant: assistantOperations.create,
    updateAssistant: assistantOperations.update,
    deleteAssistant: assistantOperations.delete,
    
    // Thread operations
    createThread: threadOperations.create,
    deleteThread: threadOperations.delete,
    
    // Message operations
    sendMessage: messageOperations.send,
    regenerate: messageOperations.regenerate,
    submitFeedback: messageOperations.submit
  }
} 
import { useCallback } from 'react'
import { useStoreSelector } from '@/store/useStore'
import { useToast } from '@/components/ui/use-toast'

export function useAssistants() {
  const { toast } = useToast()

  const {
    assistants,
    selectedAssistant,
    threads,
    threadMessages,
    expandedThreads,
    loading,
    error,
    setSelectedAssistant,
    setThreads,
    setThreadMessages,
    setExpandedThreads,
    fetchAssistants,
    fetchThreadsForAssistant,
    createAssistant,
    updateAssistant,
    deleteAssistant,
    createThread,
    deleteThread,
    sendMessage,
    regenerate,
    submitFeedback
  } = useStoreSelector(state => ({
    // State
    assistants: state.assistants,
    selectedAssistant: state.selectedAssistant,
    threads: state.threads,
    threadMessages: state.threadMessages,
    expandedThreads: state.expandedThreads,
    loading: state.loading,
    error: state.error,
    // Setters
    setSelectedAssistant: state.setSelectedAssistant,
    setThreads: state.setThreads,
    setThreadMessages: state.setThreadMessages,
    setExpandedThreads: state.setExpandedThreads,
    // Actions
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

  // Memoized handlers
  const handleCreateAssistant = useCallback(async (data) => {
    try {
      const assistant = await createAssistant(data)
      toast({
        title: 'Assistant created',
        description: 'New assistant has been created successfully.'
      })
      return assistant
    } catch (error) {
      toast({
        title: 'Failed to create assistant',
        description: error.message,
        variant: 'destructive'
      })
      throw error
    }
  }, [createAssistant, toast])

  const handleUpdateAssistant = useCallback(async (assistantId, data) => {
    try {
      const updated = await updateAssistant(assistantId, data)
      toast({
        title: 'Assistant updated',
        description: 'Assistant has been updated successfully.'
      })
      return updated
    } catch (error) {
      toast({
        title: 'Failed to update assistant',
        description: error.message,
        variant: 'destructive'
      })
      throw error
    }
  }, [updateAssistant, toast])

  const handleDeleteAssistant = useCallback(async (assistantId) => {
    try {
      await deleteAssistant(assistantId)
      toast({
        title: 'Assistant deleted',
        description: 'Assistant has been deleted successfully.'
      })
    } catch (error) {
      toast({
        title: 'Failed to delete assistant',
        description: error.message,
        variant: 'destructive'
      })
      throw error
    }
  }, [deleteAssistant, toast])

  const handleSendMessage = useCallback(async (threadId, message, options = {}) => {
    try {
      const response = await sendMessage(threadId, message, options)
      return response
    } catch (error) {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive'
      })
      throw error
    }
  }, [sendMessage, toast])

  const handleRegenerate = useCallback(async (threadId) => {
    try {
      await regenerate(threadId)
      toast({
        title: 'Response regenerated',
        description: 'A new response has been generated.'
      })
    } catch (error) {
      toast({
        title: 'Failed to regenerate response',
        description: error.message,
        variant: 'destructive'
      })
      throw error
    }
  }, [regenerate, toast])

  const handleFeedback = useCallback(async (messageId, type) => {
    try {
      await submitFeedback(messageId, type)
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback.'
      })
    } catch (error) {
      toast({
        title: 'Failed to submit feedback',
        description: error.message,
        variant: 'destructive'
      })
      throw error
    }
  }, [submitFeedback, toast])

  return {
    // State
    assistants,
    selectedAssistant,
    threads,
    threadMessages,
    expandedThreads,
    loading,
    error,

    // Setters
    setSelectedAssistant,
    setThreads,
    setThreadMessages,
    setExpandedThreads,

    // Actions
    fetchAssistants,
    fetchThreadsForAssistant,
    createAssistant: handleCreateAssistant,
    updateAssistant: handleUpdateAssistant,
    deleteAssistant: handleDeleteAssistant,
    createThread,
    deleteThread,
    sendMessage: handleSendMessage,
    regenerate: handleRegenerate,
    submitFeedback: handleFeedback
  }
} 
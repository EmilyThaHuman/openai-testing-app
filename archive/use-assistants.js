import { useCallback } from 'react';
import { useStoreShallow } from '@/store/useStore';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { useToast } from '@/components/ui/use-toast';

export const useAssistants = () => {
  const {
    assistants,
    selectedAssistant,
    loading,
    error,
    setAssistants,
    setSelectedAssistant,
    setLoading,
    setError
  } = useStoreShallow((state) => ({
    assistants: state.assistants,
    selectedAssistant: state.selectedAssistant,
    loading: state.loading,
    error: state.error,
    setAssistants: state.setAssistants,
    setSelectedAssistant: state.setSelectedAssistant,
    setLoading: state.setLoading,
    setError: state.setError
  }));

  const { toast } = useToast();

  const fetchAssistants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await UnifiedOpenAIService.assistants.list();
      setAssistants(response.data);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error fetching assistants",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [setAssistants, setError, setLoading, toast]);

  const createAssistant = useCallback(async (assistantData) => {
    setLoading(true);
    try {
      const assistant = await UnifiedOpenAIService.assistants.create(assistantData);
      setAssistants((prev) => [...prev, assistant]);
      toast({
        title: "Success",
        description: "Assistant created successfully",
      });
      return assistant;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error creating assistant",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setAssistants, setError, setLoading, toast]);

  const updateAssistant = useCallback(async (assistantId, updateData) => {
    setLoading(true);
    try {
      const updated = await UnifiedOpenAIService.assistants.update(assistantId, updateData);
      setAssistants((prev) => 
        prev.map((assistant) => 
          assistant.id === assistantId ? updated : assistant
        )
      );
      toast({
        title: "Success",
        description: "Assistant updated successfully",
      });
      return updated;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error updating assistant",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setAssistants, setError, setLoading, toast]);

  const deleteAssistant = useCallback(async (assistantId) => {
    setLoading(true);
    try {
      await UnifiedOpenAIService.assistants.delete(assistantId);
      setAssistants((prev) => prev.filter((a) => a.id !== assistantId));
      if (selectedAssistant?.id === assistantId) {
        setSelectedAssistant(null);
      }
      toast({
        title: "Success",
        description: "Assistant deleted successfully",
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error deleting assistant",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedAssistant?.id, setAssistants, setError, setLoading, setSelectedAssistant, toast]);

  return {
    assistants,
    selectedAssistant,
    loading,
    error,
    setSelectedAssistant,
    fetchAssistants,
    createAssistant,
    updateAssistant,
    deleteAssistant,
  };
}; 
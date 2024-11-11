import { useStoreShallow } from "@/store/useStore";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import { useToast } from "@/components/ui/use-toast";

export function useVectorStore() {
  const store = useStoreShallow((state) => ({
    vectorStores: state.vectorStores,
    selectedVectorStore: state.selectedVectorStore,
    loading: state.loading,
    error: state.error,
    setVectorStores: state.setVectorStores,
    setSelectedVectorStore: state.setSelectedVectorStore,
    setLoading: state.setLoading,
    setError: state.setError
  }));
  
  const { toast } = useToast();

  return {
    ...store,
    fetchVectorStores: async () => {
      store.setLoading(true);
      try {
        const response = await UnifiedOpenAIService.vectorStores.list();
        store.setVectorStores(response.data);
      } catch (err) {
        store.setError(err.message);
        toast({
          title: "Error fetching vector stores",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        store.setLoading(false);
      }
    }
  };
}

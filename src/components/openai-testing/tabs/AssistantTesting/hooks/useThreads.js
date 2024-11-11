import { useStoreShallow } from "@/store/useStore";
import { useToast } from "@/components/ui/use-toast";

export const useThreads = (selectedAssistant) => {
  const {
    threads,
    threadMessages,
    expandedThreads,
    loading,
    setThreads,
    setThreadMessages,
    setExpandedThreads,
    setLoading
  } = useStoreShallow((state) => ({
    threads: state.threads,
    threadMessages: state.threadMessages,
    expandedThreads: state.expandedThreads,
    loading: state.loading,
    setThreads: state.setThreads,
    setThreadMessages: state.setThreadMessages,
    setExpandedThreads: state.setExpandedThreads,
    setLoading: state.setLoading
  }));

  // Rest of the hook implementation using store methods instead of local state
}; 
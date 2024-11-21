import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { getTimeRangeDate } from '@/lib/utils/date';
import { processMetricsData } from '@/lib/utils/metrics';

export const createBillingSlice = (set, get) => ({
  // State
  usage: null,
  currentPlan: null,
  timeRange: '7d',
  isLoadingBilling: false,
  billingError: null,

  // Actions
  setTimeRange: (range) => {
    set({ timeRange: range });
  },

  fetchBillingDetails: async () => {
    set({ isLoadingBilling: true, billingError: null });
    try {
      const startDate = getTimeRangeDate(get().timeRange);
      const response = await UnifiedOpenAIService.billing.getUsage(startDate);
      
      const processedData = processMetricsData(response.data);
      
      set({
        usage: processedData,
        currentPlan: response.plan,
        isLoadingBilling: false
      });
    } catch (error) {
      set({
        billingError: error.message,
        isLoadingBilling: false
      });
    }
  },

  // Reset state
  resetBillingState: () => {
    set({
      usage: null,
      currentPlan: null,
      timeRange: '7d',
      isLoadingBilling: false,
      billingError: null
    });
  }
});

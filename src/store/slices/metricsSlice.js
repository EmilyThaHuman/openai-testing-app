import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { processMetricsData } from '@/lib/utils/metrics';
import { getTimeRangeDate } from '@/lib/utils/date';

export const createMetricsSlice = (set, get) => ({
  // State
  metrics: null,
  isLoadingMetrics: false,
  metricsError: null,
  apiLatency: [],
  endpointStats: {},
  apiErrors: [],

  // Actions
  fetchMetrics: async (timeRange = '7d') => {
    set({ isLoadingMetrics: true, metricsError: null });
    try {
      const startDate = getTimeRangeDate(timeRange);
      const response = await UnifiedOpenAIService.metrics.get(startDate);
      const processedMetrics = processMetricsData(response.data);
      set({ metrics: processedMetrics, isLoadingMetrics: false });
    } catch (error) {
      set({ metricsError: error.message, isLoadingMetrics: false });
      throw error;
    }
  },

  trackApiCall: (endpoint, duration) => {
    set((state) => ({
      apiLatency: [...state.apiLatency, { endpoint, duration, timestamp: Date.now() }],
      endpointStats: {
        ...state.endpointStats,
        [endpoint]: {
          totalCalls: (state.endpointStats[endpoint]?.totalCalls || 0) + 1,
          avgLatency: state.endpointStats[endpoint]?.avgLatency 
            ? (state.endpointStats[endpoint].avgLatency + duration) / 2 
            : duration,
          errors: state.endpointStats[endpoint]?.errors || 0
        }
      }
    }));
  },

  trackApiError: (endpoint, error) => {
    set((state) => ({
      apiErrors: [...state.apiErrors, { endpoint, error, timestamp: Date.now() }],
      endpointStats: {
        ...state.endpointStats,
        [endpoint]: {
          ...state.endpointStats[endpoint],
          errors: (state.endpointStats[endpoint]?.errors || 0) + 1
        }
      }
    }));
  },

  resetMetricsState: () => {
    set({
      metrics: null,
      isLoadingMetrics: false,
      metricsError: null,
      apiLatency: [],
      endpointStats: {},
      apiErrors: []
    });
  }
});
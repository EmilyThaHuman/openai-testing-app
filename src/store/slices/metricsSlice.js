import { supabase } from '@/lib/supabase/client'

export const createMetricsSlice = (set, get) => ({
  // Metrics State
  metrics: {
    total: 0,
    chat: 0,
    images: 0,
    audio: 0,
    embeddings: 0,
    history: [],
    responseTimes: [],
    recentActivity: [],
    errorRates: {},
    costBreakdown: {},
    modelUsage: {}
  },
  isLoadingMetrics: false,
  metricsError: null,
  timeRange: '24h',

  // Actions
  setTimeRange: (range) => set({ timeRange: range }),

  // Fetch metrics data
  fetchMetrics: async (timeRange = '24h') => {
    const { supabase } = get()
    set({ isLoadingMetrics: true, metricsError: null })

    try {
      const { data: metricsData, error } = await supabase
        .from('api_metrics')
        .select('*')
        .eq('profile_id', supabase.auth.user()?.id)
        .gte('timestamp', getTimeRangeDate(timeRange))
        .order('timestamp', { ascending: false })

      if (error) throw error

      // Process metrics data
      const processedData = processMetricsData(metricsData)
      set({ metrics: processedData })

      // Subscribe to real-time updates
      subscribeToMetrics()

    } catch (error) {
      set({ metricsError: error.message })
    } finally {
      set({ isLoadingMetrics: false })
    }
  },

  // Subscribe to real-time metrics updates
  subscribeToMetrics: () => {
    const { supabase } = get()
    
    const channel = supabase
      .channel('api_metrics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'api_metrics',
          filter: `profile_id=eq.${supabase.auth.user()?.id}`
        },
        (payload) => {
          // Update metrics in real-time
          set((state) => ({
            metrics: updateMetricsWithPayload(state.metrics, payload)
          }))
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  },

  // Export metrics data
  exportMetrics: async (format = 'json') => {
    const { metrics } = get()
    
    switch (format) {
      case 'csv':
        return exportToCsv(metrics)
      case 'pdf':
        return exportToPdf(metrics)
      default:
        return JSON.stringify(metrics, null, 2)
    }
  }
})

// Helper functions
const getTimeRangeDate = (range) => {
  const now = new Date()
  switch (range) {
    case '24h':
      return new Date(now.setHours(now.getHours() - 24))
    case '7d':
      return new Date(now.setDate(now.getDate() - 7))
    case '30d':
      return new Date(now.setDate(now.getDate() - 30))
    default:
      return new Date(now.setHours(now.getHours() - 24))
  }
}

const processMetricsData = (data) => {
  return {
    total: data.reduce((acc, curr) => acc + curr.total_calls, 0),
    chat: data.reduce((acc, curr) => acc + curr.chat_calls, 0),
    images: data.reduce((acc, curr) => acc + curr.image_calls, 0),
    audio: data.reduce((acc, curr) => acc + curr.audio_calls, 0),
    embeddings: data.reduce((acc, curr) => acc + curr.embedding_calls, 0),
    history: processHistoryData(data),
    responseTimes: processResponseTimes(data),
    recentActivity: processRecentActivity(data),
    errorRates: calculateErrorRates(data),
    costBreakdown: calculateCosts(data),
    modelUsage: calculateModelUsage(data)
  }
}

const updateMetricsWithPayload = (currentMetrics, payload) => {
  const { new: newMetric } = payload
  
  return {
    ...currentMetrics,
    total: currentMetrics.total + newMetric.total_calls,
    chat: currentMetrics.chat + newMetric.chat_calls,
    images: currentMetrics.images + newMetric.image_calls,
    audio: currentMetrics.audio + newMetric.audio_calls,
    history: [newMetric, ...currentMetrics.history].slice(0, 100),
    recentActivity: [
      {
        id: newMetric.id,
        type: newMetric.type,
        description: newMetric.description,
        timestamp: newMetric.timestamp,
        duration: newMetric.duration
      },
      ...currentMetrics.recentActivity
    ].slice(0, 50)
  }
} 
export const createBillingSlice = (set, get) => ({
  // Initialize with default values
  usage: {
    total: 0,
    chat: 0,
    images: 0,
    audio: 0,
    embeddings: 0,
    history: [],
    responseTimes: [],
    recentActivity: [],
  },
  currentPlan: null,
  billingHistory: [],
  isLoadingBilling: false,
  billingError: null,

  // Actions
  setCurrentPlan: plan => set({ currentPlan: plan }),
  updateUsage: usage => set({ usage }),
  setBillingHistory: history => set({ billingHistory: history }),
  setIsLoadingBilling: loading => set({ isLoadingBilling: loading }),
  setBillingError: error => set({ billingError: error }),

  // Async Actions
  fetchBillingDetails: async () => {
    try {
      set({ isLoadingBilling: true, billingError: null });

      // Fetch from your API or Supabase
      const { data, error } = await get()
        .supabase.from('api_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Process the data
      const processedData = {
        total: data.length,
        chat: data.filter(d => d.type === 'chat').length,
        images: data.filter(d => d.type === 'image').length,
        audio: data.filter(d => d.type === 'audio').length,
        history: data,
        responseTimes: processResponseTimes(data),
        recentActivity: data.slice(0, 10),
      };

      set({ usage: processedData });
    } catch (error) {
      set({ billingError: error.message });
      throw error;
    } finally {
      set({ isLoadingBilling: false });
    }
  },

  updateSubscription: async planId => {
    try {
      set({ isLoadingBilling: true, billingError: null });
      // Update subscription through your API
      const response = await fetch('/api/billing/subscription', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      });
      const data = await response.json();
      set({ currentPlan: data.plan });
    } catch (error) {
      set({ billingError: error.message });
    } finally {
      set({ isLoadingBilling: false });
    }
  },
});

// Helper function to process response times
const processResponseTimes = data => {
  return data.reduce((acc, curr) => {
    const existing = acc.find(a => a.endpoint === curr.endpoint);
    if (existing) {
      existing.time = (existing.time + curr.duration) / 2;
    } else {
      acc.push({
        endpoint: curr.endpoint,
        time: curr.duration,
      });
    }
    return acc;
  }, []);
};

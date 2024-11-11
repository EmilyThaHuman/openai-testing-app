// import { produce } from 'immer';

// export const createPerformanceSlice = (set, get) => ({
//   metrics: {
//     apiLatency: [],
//     apiErrors: [],
//     endpointStats: {},
//   },
  
//   addApiLatency: (endpoint, data) => 
//     set(produce((state) => {
//       // Add to general latency metrics
//       state.metrics.apiLatency.push({
//         endpoint,
//         ...data
//       });
      
//       // Keep last 100 measurements
//       if (state.metrics.apiLatency.length > 100) {
//         state.metrics.apiLatency.shift();
//       }
      
//       // Update endpoint statistics
//       if (!state.metrics.endpointStats[endpoint]) {
//         state.metrics.endpointStats[endpoint] = {
//           totalCalls: 0,
//           totalDuration: 0,
//           errors: 0,
//           avgLatency: 0,
//         };
//       }
      
//       const stats = state.metrics.endpointStats[endpoint];
//       stats.totalCalls++;
//       stats.totalDuration += data.duration;
//       stats.avgLatency = stats.totalDuration / stats.totalCalls;
      
//       if (data.status === 'error') {
//         stats.errors++;
//         state.metrics.apiErrors.push({
//           endpoint,
//           error: data.error,
//           timestamp: data.timestamp
//         });
//       }
//     })),

//   getEndpointStats: (endpoint) => {
//     const state = get();
//     return state.metrics.endpointStats[endpoint] || null;
//   },

//   getRecentErrors: (limit = 10) => {
//     const state = get();
//     return state.metrics.apiErrors.slice(-limit);
//   },
// }); 
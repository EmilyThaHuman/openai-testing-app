// import { useStore } from '@/store/useStore';

// export class ServiceMonitor {
//   static async trackApiCall(endpoint, operation) {
//     const startTime = performance.now();
//     const store = useStore.getState();
    
//     try {
//       const result = await operation();
//       const duration = performance.now() - startTime;
      
//       store.addApiLatency(endpoint, {
//         duration,
//         status: 'success',
//         timestamp: Date.now()
//       });
      
//       return result;
//     } catch (error) {
//       const duration = performance.now() - startTime;
      
//       store.addApiLatency(endpoint, {
//         duration,
//         status: 'error',
//         error: error.message,
//         timestamp: Date.now()
//       });
      
//       store.trackError('api', {
//         endpoint,
//         error: error.message,
//         timestamp: Date.now()
//       });
      
//       throw error;
//     }
//   }
// } 
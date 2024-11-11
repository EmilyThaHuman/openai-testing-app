// import { useEffect, useRef } from 'react';
// import { useStore } from '@/store/useStore';

// export const usePerformanceMonitor = (componentId) => {
//   const { trackRenderTime, addApiLatency } = useStore(state => ({
//     trackRenderTime: state.trackRenderTime,
//     addApiLatency: state.addApiLatency
//   }));
  
//   const renderStartTime = useRef(performance.now());

//   useEffect(() => {
//     const duration = performance.now() - renderStartTime.current;
//     trackRenderTime(componentId, duration);

//     return () => {
//       renderStartTime.current = performance.now();
//     };
//   });

//   const trackApiCall = async (endpoint, promise) => {
//     const startTime = performance.now();
//     try {
//       const result = await promise;
//       const duration = performance.now() - startTime;
//       addApiLatency(endpoint, duration);
//       return result;
//     } catch (error) {
//       const duration = performance.now() - startTime;
//       addApiLatency(endpoint, duration);
//       throw error;
//     }
//   };

//   return { trackApiCall };
// }; 
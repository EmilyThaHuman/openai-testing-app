import { useEffect } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function usePerformanceMonitoring() {
  useEffect(() => {
    const reportWebVitals = ({ name, value, id }) => {
      // Send to your analytics service
      console.log(`${name}: ${value} (ID: ${id})`);
    };

    getCLS(reportWebVitals);
    getFID(reportWebVitals);
    getFCP(reportWebVitals);
    getLCP(reportWebVitals);
    getTTFB(reportWebVitals);
  }, []);
} 
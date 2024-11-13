import { useEffect, useRef } from 'react';

export function usePerformanceMonitor(componentName) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTime.current;

    if (import.meta.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Render #${renderCount.current}`);
      console.log(`Render time: ${renderTime.toFixed(2)}ms`);
    }

    lastRenderTime.current = currentTime;
  });
} 
import { subscribeWithSelector } from 'zustand/middleware';

export const performanceMiddleware = (config) => (set, get, api) => {
  let updateScheduled = false
  
  return config(
    (...args) => {
      if (updateScheduled) {
        return
      }

      updateScheduled = true
      
      // Schedule state update for next frame
      requestAnimationFrame(() => {
        const before = performance.now()
        set(...args)
        const after = performance.now()
        
        if (after - before > 16) {
          console.warn(
            `Slow state update detected (${Math.round(after - before)}ms)`,
            {
              action: args[0],
              timeTaken: after - before,
              previousState: get(),
            }
          )
        }
        
        updateScheduled = false
      })
    },
    get,
    api
  )
} 
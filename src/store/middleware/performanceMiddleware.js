import { subscribeWithSelector } from 'zustand/middleware';

export const performanceMiddleware = (config) => (set, get, api) =>
  config(
    (...args) => {
      const before = performance.now();
      const state = get();
      const result = set(...args);
      const after = performance.now();
      
      console.debug(
        `State update took ${after - before}ms`,
        {
          action: args[0],
          timeTaken: after - before,
          previousState: state,
          newState: get(),
        }
      );
      
      return result;
    },
    get,
    api
  ); 
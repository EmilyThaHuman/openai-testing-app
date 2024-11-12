// trackingWrapper.js

import { apiTracker } from './ApiTracker';

export const withTracking = async (endpoint, operation) => {
  if (!apiTracker.checkRateLimit(endpoint)) {
    throw new Error(`Rate limit exceeded for endpoint: ${endpoint}`);
  }

  const startTime = apiTracker.startTracking(endpoint);
  
  try {
    const result = await operation();
    apiTracker.endTracking(endpoint, startTime, 'success');
    return result;
  } catch (error) {
    apiTracker.endTracking(endpoint, startTime, 'error');
    throw error;
  }
};

export const wrapWithTracking = (obj, path = '') => {
  return new Proxy(obj, {
    get(target, prop) {
      const value = target[prop];
      const newPath = path ? `${path}.${prop}` : prop;

      // If the value is a function, wrap it with tracking
      if (typeof value === 'function') {
        return async (...args) => {
          return withTracking(newPath, () => value.apply(target, args));
        };
      }

      // If the value is an object (and not null), recursively wrap it
      if (value && typeof value === 'object') {
        return wrapWithTracking(value, newPath);
      }

      return value;
    }
  });
};
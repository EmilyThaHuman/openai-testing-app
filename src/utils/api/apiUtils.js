import { cacheManager } from '../cache/cacheManager';

export class APIUtils {
  static async withCache(key, operation, ttl = 3600000) {
    const cached = cacheManager.get(key);
    if (cached) return cached;

    const result = await operation();
    cacheManager.set(key, result, ttl);
    return result;
  }

  static async withRetry(operation, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  static async withErrorHandling(operation, errorHandler) {
    try {
      return await operation();
    } catch (error) {
      return errorHandler(error);
    }
  }

  static rateLimit(fn, limit, interval = 60000) {
    const queue = [];
    let timeWindow = Date.now();
    let count = 0;

    return async function (...args) {
      if (Date.now() > timeWindow + interval) {
        timeWindow = Date.now();
        count = 0;
      }

      if (count >= limit) {
        return new Promise((resolve) => {
          queue.push({ args, resolve });
        });
      }

      count++;
      const result = await fn.apply(this, args);

      if (queue.length > 0 && count < limit) {
        const { args, resolve } = queue.shift();
        resolve(fn.apply(this, args));
      }

      return result;
    };
  }
} 
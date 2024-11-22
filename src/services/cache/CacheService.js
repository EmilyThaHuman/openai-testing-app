export const CACHE_KEYS = {
  ASSISTANTS: "assistants_cache",
  THREADS: "threads_cache",
  MESSAGES: "thread_messages_cache",
  SETTINGS: "settings_cache",
  RUNS: "runs_cache",
  RUN_STEPS: "run_steps_cache",
  CHATS: "chats",
  ACTIVE_CHAT_ID: "activeChatId",
  CHAT_SETTINGS: "chatSettings",
  SAVED_PRESETS: "savedPresets",
  SELECTED_PRESET: "selectedPreset",
  MODEL: "model",
};

export const CACHE_TTL = {
  ASSISTANTS: 1000 * 60 * 5, // 5 minutes
  THREADS: 1000 * 60 * 2, // 2 minutes
  MESSAGES: 1000 * 60, // 1 minute
  SETTINGS: 1000 * 60 * 60 * 24, // 24 hours
};

class CacheService {
  constructor(storage = localStorage) {
    this.storage = storage;
    this.cache = new Map();
    this.initializeCache();
  }

  initializeCache() {
    try {
      Object.keys(CACHE_KEYS).forEach(key => {
        const data = this.getCacheItem(CACHE_KEYS[key]);
        if (data) {
          this.cache.set(CACHE_KEYS[key], data);
        }
      });
    } catch (error) {
      console.error('Cache initialization failed:', error);
    }
  }

  getCacheKey(key, identifier) {
    return identifier ? `${key}_${identifier}` : key;
  }

  getCacheItem(key) {
    try {
      const item = this.storage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      return "data" in parsed ? parsed : { data: parsed, timestamp: Date.now() };
    } catch (error) {
      console.error('Error getting cache item:', error);
      return null;
    }
  }

  setCacheItem(key, data, ttl) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now() + ttl,
      };
      this.storage.setItem(key, JSON.stringify(cacheItem));
      this.cache.set(key, cacheItem);
    } catch (error) {
      console.error('Error setting cache item:', error);
    }
  }

  get(key, identifier = null) {
    const cacheKey = this.getCacheKey(key);
    const item = this.cache.get(cacheKey) || this.getCacheItem(cacheKey);

    if (!item) return identifier ? null : {};
    
    if (Date.now() > item.timestamp) {
      this.remove(key, identifier);
      return identifier ? null : {};
    }

    if (identifier && item.data[identifier]) {
      return item.data[identifier];
    }

    return identifier ? null : item.data;
  }

  set(key, data, identifier = null) {
    const cacheKey = this.getCacheKey(key);
    const ttl = CACHE_TTL[key] || CACHE_TTL.MESSAGES;

    if (identifier) {
      const existingCache = this.get(key) || {};
      const updatedData = {
        ...existingCache,
        [identifier]: data,
      };
      this.setCacheItem(cacheKey, updatedData, ttl);
    } else {
      this.setCacheItem(cacheKey, data, ttl);
    }
  }

  remove(key, identifier = null) {
    const cacheKey = this.getCacheKey(key);

    if (identifier) {
      const existingCache = this.get(key) || {};
      delete existingCache[identifier];
      this.setCacheItem(cacheKey, existingCache, CACHE_TTL[key]);
    } else {
      this.storage.removeItem(cacheKey);
      this.cache.delete(cacheKey);
    }
  }

  clear() {
    this.storage.clear();
    this.cache.clear();
  }

  // New method for checking cache health
  checkCacheHealth() {
    const health = {
      size: 0,
      expired: 0,
      valid: 0
    };

    this.cache.forEach((value, key) => {
      health.size++;
      if (Date.now() > value.timestamp) {
        health.expired++;
        this.remove(key);
      } else {
        health.valid++;
      }
    });

    return health;
  }
}

export const cacheService = new CacheService();

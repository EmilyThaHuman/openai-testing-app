const CACHE_KEYS = {
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

const CACHE_TTL = {
  ASSISTANTS: 1000 * 60 * 5, // 5 minutes
  THREADS: 1000 * 60 * 2, // 2 minutes
  MESSAGES: 1000 * 60, // 1 minute
  SETTINGS: 1000 * 60 * 60 * 24, // 24 hours
};

class CacheService {
  constructor(storage = localStorage) {
    this.storage = storage;
  }

  getCacheKey(key, identifier) {
    return identifier ? `${key}_${identifier}` : key;
  }

  getCacheItem(key) {
    const item = this.storage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);
    // Handle both legacy and new cache format
    return "data" in parsed ? parsed : { data: parsed, timestamp: Date.now() };
  }

  setCacheItem(key, data, ttl) {
    const cacheItem = {
      data,
      timestamp: Date.now() + ttl,
    };
    this.storage.setItem(key, JSON.stringify(cacheItem));
  }

  get(key, identifier = null) {
    const cacheKey = this.getCacheKey(key);
    const item = this.getCacheItem(cacheKey);

    if (!item) return identifier ? null : {};
    if (Date.now() > item.timestamp) {
      this.storage.removeItem(cacheKey);
      return identifier ? null : {};
    }

    // If identifier is provided, return that specific thread's messages
    if (identifier && item.data[identifier]) {
      return item.data[identifier];
    }

    // Otherwise return all messages
    return identifier ? null : item.data;
  }

  set(key, data, identifier = null) {
    const cacheKey = this.getCacheKey(key);
    const ttl = CACHE_TTL[key] || CACHE_TTL.MESSAGES;

    if (identifier) {
      // Get existing cache data
      const existingCache = this.get(key) || {};

      // Update only the specific thread's messages
      const updatedData = {
        ...existingCache,
        [identifier]: data,
      };

      this.setCacheItem(cacheKey, updatedData, ttl);
    } else {
      // Set the entire cache data
      this.setCacheItem(cacheKey, data, ttl);
    }
  }

  remove(key, identifier = null) {
    const cacheKey = this.getCacheKey(key);

    if (identifier) {
      // Remove only the specific thread's messages
      const existingCache = this.get(key) || {};
      delete existingCache[identifier];
      this.setCacheItem(cacheKey, existingCache, CACHE_TTL[key]);
    } else {
      // Remove entire cache entry
      this.storage.removeItem(cacheKey);
    }
  }

  clear() {
    this.storage.clear();
  }
}

export const cacheService = new CacheService();
export { CACHE_KEYS };

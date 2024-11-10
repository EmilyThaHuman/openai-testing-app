/**
 * @typedef {Object} CacheOptions
 * @property {number} [ttl]
 * @property {number} [maxSize]
 */

/**
 * @typedef {Object} CacheItem
 * @property {*} value
 * @property {number} expires
 */

export class CacheManager {
  /**
   * @param {CacheOptions} [options={}]
   */
  constructor(options = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 100;
  }

  /**
   * @param {string} key
   * @param {*} value
   * @param {number} [ttl]
   */
  set(key, value, ttl) {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expires: ttl ? Date.now() + ttl : Infinity,
    });
  }

  /**
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    if (item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

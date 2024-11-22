/**
 * @typedef {Object} MemoryInfo
 * @property {number} usedJSHeapSize
 * @property {number} jsHeapSizeLimit
 */

/**
 * @typedef {Performance & { memory: MemoryInfo }} ExtendedPerformance
 */

/**
 * @typedef {Object} CacheManagerInstance
 * @property {() => void} clear
 */

/**
 * @typedef {Window & { CacheManager: { getInstance: () => CacheManagerInstance } }} ExtendedWindow
 */

export class MemoryManager {
  constructor() {
    this.checkMemoryUsage = this.checkMemoryUsage.bind(this);
  }

  /**
   * @returns {number}
   */
  getMemoryUsage() {
    if (typeof window !== 'undefined' && window.performance) {
      const performance = window.performance;
      if ('memory' in performance) {
        const extendedPerf = /** @type {ExtendedPerformance} */ (performance);
        return extendedPerf.memory.usedJSHeapSize;
      }
    }
    return 0;
  }

  /**
   * @param {number} threshold
   */
  checkMemoryUsage(threshold = 0.9) {
    const usage = this.getMemoryUsage();
    if (usage > 0) {
      const maxMemory = /** @type {ExtendedPerformance} */ (window.performance).memory.jsHeapSizeLimit;
      if (usage / maxMemory > threshold) {
        this.clearMemory();
      }
    }
  }

  clearMemory() {
    if (typeof window !== 'undefined') {
      const extWindow = /** @type {ExtendedWindow} */ (window);
      if (extWindow.CacheManager) {
        extWindow.CacheManager.getInstance().clear();
      }
    }
  }
}

import { supabase } from "./supabase";

/**
 * @typedef {Object} Metric
 * @property {string} name - The name of the metric
 * @property {number} value - The measured value
 * @property {number} timestamp - Unix timestamp when the metric was recorded
 */

/**
 * Class for monitoring and reporting performance metrics.
 * Implements the Singleton pattern to ensure only one instance exists.
 */
export class PerformanceMonitor {
  /**
   * Private constructor to prevent direct construction calls with the `new` operator.
   */
  constructor() {
    /** @private */
    this.metrics = [];
  }

  /**
   * Gets the singleton instance of PerformanceMonitor
   * @returns {PerformanceMonitor} The singleton instance
   */
  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Starts measuring performance for a named operation
   * @param {string} name - The name of the operation to measure
   * @returns {Function} A function to call when the operation is complete
   */
  startMeasure(name) {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.metrics.push({
        name,
        value: duration,
        timestamp: Date.now(),
      });
    };
  }

  /**
   * Reports collected metrics to the Supabase backend and clears the metrics array
   * @returns {Promise<void>}
   */
  async reportMetrics() {
    if (this.metrics.length === 0) return;

    try {
      await supabase.from("performance_metrics").insert(this.metrics);

      this.metrics = [];
    } catch (error) {
      console.error("Failed to report metrics:", error);
    }
  }

  /**
   * Gets a copy of the current metrics array
   * @returns {Array<Metric>} A copy of the collected metrics
   */
  getMetrics() {
    return [...this.metrics];
  }

  /**
   * Clears all collected metrics
   */
  clearMetrics() {
    this.metrics = [];
  }
}

// Initialize the singleton instance property
/** @private */
PerformanceMonitor.instance = null;

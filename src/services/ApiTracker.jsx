// ApiTracker.js

export class ApiTracker {
  constructor() {
    this.metrics = {
      calls: new Map(),
      latency: new Map(),
      errors: new Map(),
      lastUsed: new Map(),
      details: new Map(),
      totalCalls: 0,
      rateLimits: new Map()
    };

    // Initialize cache for rate limiting
    this.rateLimit = {
      timestamps: new Map(),
      windowMs: 60000, // 1 minute window
      maxRequests: 50  // 50 requests per minute
    };
  }

  startTracking(endpoint) {
    const timestamp = Date.now();
    this.updateCallMetrics(endpoint);
    return timestamp;
  }

  endTracking(endpoint, startTime, status = 'success') {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Update latency metrics
    const latencyStats = this.metrics.latency.get(endpoint) || {
      total: 0,
      count: 0,
      min: Infinity,
      max: 0,
      average: 0
    };

    latencyStats.total += duration;
    latencyStats.count++;
    latencyStats.min = Math.min(latencyStats.min, duration);
    latencyStats.max = Math.max(latencyStats.max, duration);
    latencyStats.average = latencyStats.total / latencyStats.count;

    this.metrics.latency.set(endpoint, latencyStats);

    // Update last used timestamp
    this.metrics.lastUsed.set(endpoint, endTime);

    // Track errors if status is not success
    if (status !== 'success') {
      const errors = this.metrics.errors.get(endpoint) || [];
      errors.push({
        timestamp: endTime,
        status,
        duration
      });
      this.metrics.errors.set(endpoint, errors);
    }

    return duration;
  }

  updateCallMetrics(endpoint) {
    // Update endpoint-specific calls
    const calls = this.metrics.calls.get(endpoint) || 0;
    this.metrics.calls.set(endpoint, calls + 1);

    // Update total calls
    this.metrics.totalCalls++;

    // Update rate limiting data
    const now = Date.now();
    const timestamps = this.rateLimit.timestamps.get(endpoint) || [];
    timestamps.push(now);

    // Remove timestamps outside the current window
    const windowStart = now - this.rateLimit.windowMs;
    const validTimestamps = timestamps.filter(t => t > windowStart);
    this.rateLimit.timestamps.set(endpoint, validTimestamps);
  }

  getMetrics(endpoint) {
    if (endpoint) {
      return {
        calls: this.metrics.calls.get(endpoint) || 0,
        latency: this.metrics.latency.get(endpoint) || { average: 0, min: 0, max: 0 },
        errors: this.metrics.errors.get(endpoint) || [],
        lastUsed: this.metrics.lastUsed.get(endpoint) || null,
        currentRate: this.getCurrentRate(endpoint)
      };
    }

    return {
      totalCalls: this.metrics.totalCalls,
      endpoints: Array.from(this.metrics.calls.keys()).map(endpoint => ({
        endpoint,
        metrics: this.getMetrics(endpoint)
      }))
    };
  }

  getCurrentRate(endpoint) {
    const timestamps = this.rateLimit.timestamps.get(endpoint) || [];
    const now = Date.now();
    const windowStart = now - this.rateLimit.windowMs;
    return timestamps.filter(t => t > windowStart).length;
  }

  checkRateLimit(endpoint) {
    const currentRate = this.getCurrentRate(endpoint);
    return currentRate < this.rateLimit.maxRequests;
  }

  reset() {
    this.metrics = {
      calls: new Map(),
      latency: new Map(),
      errors: new Map(),
      lastUsed: new Map(),
      totalCalls: 0
    };
    this.rateLimit.timestamps.clear();
  }

  updateRateLimit(endpoint, remaining, limit) {
    this.metrics.rateLimits.set(endpoint, { remaining, limit });
  }

  storeMetricDetails(endpoint, details) {
    const existingDetails = this.metrics.details.get(endpoint) || [];
    this.metrics.details.set(endpoint, [
      ...existingDetails,
      {
        ...details,
        timestamp: Date.now()
      }
    ].slice(-100)); // Keep last 100 entries
  }
}

export const apiTracker = new ApiTracker();
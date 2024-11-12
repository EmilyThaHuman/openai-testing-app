const { REACT_AGENT_CONFIG } = require('@/config/ai/agent');

class SimpleSemanticCache {
  constructor(minProximity = 0.95) {
    this.cache = new Map();
    this.minProximity = minProximity;
  }

  async set(key, value) {
    this.cache.set(key, value);
  }

  async get(key) {
    // Placeholder similarity check logic
    const result = Array.from(this.cache.entries()).find(([storedKey]) =>
      this.isSimilar(storedKey, key)
    );
    return result ? result[1] : null;
  }

  async delete(key) {
    this.cache.delete(key);
  }

  isSimilar(storedKey, key) {
    // Placeholder for similarity checking between keys
    return storedKey === key; // Replace with actual similarity logic
  }
}

// Initialize semantic cache instance if config allows
export let semanticCache;
if (REACT_AGENT_CONFIG.useSemanticCache) {
  semanticCache = new SimpleSemanticCache(0.95);
}

// Function to set data in the semantic cache
export async function setInSemanticCache(userMessage, data) {
  if (
    REACT_AGENT_CONFIG.useSemanticCache &&
    semanticCache &&
    data.llmResponse.length > 0
  ) {
    await semanticCache.set(userMessage, JSON.stringify(data));
  }
}

// Function to clear a specific cache entry by user message
export async function clearSemanticCache(userMessage) {
  'use server';
  console.log('Clearing semantic cache for user message:', userMessage);
  if (!REACT_AGENT_CONFIG.useSemanticCache || !semanticCache) return;
  await semanticCache.delete(userMessage);
}

// Function to initialize or reinitialize the semantic cache
export async function initializeSemanticCache() {
  if (REACT_AGENT_CONFIG.useSemanticCache) {
    semanticCache = new SimpleSemanticCache(0.95);
  }
}

// Function to get data from the semantic cache
export async function getFromSemanticCache(userMessage) {
  if (semanticCache) {
    return semanticCache.get(userMessage);
  }
  return null;
}

export default {
  setInSemanticCache,
  clearSemanticCache,
  initializeSemanticCache,
  getFromSemanticCache,
};

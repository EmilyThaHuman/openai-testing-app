/**
 * Process raw metrics data into usage statistics
 * @param {Array} metricsData - Raw metrics data from the API
 * @returns {Object} Processed usage statistics
 */
export const processMetricsData = (metricsData) => {
  if (!Array.isArray(metricsData)) return {};

  const usage = {
    chat: 0,
    images: 0,
    audio: 0,
    embeddings: 0,
    total: 0,
    costBreakdown: {
      chat: 0,
      images: 0,
      audio: 0,
      embeddings: 0
    },
    history: []
  };

  // Process each metric entry
  metricsData.forEach(metric => {
    // Add to totals
    usage.chat += metric.chat_tokens || 0;
    usage.images += metric.image_generations || 0;
    usage.audio += metric.audio_minutes || 0;
    usage.embeddings += metric.embedding_tokens || 0;

    // Calculate costs
    usage.costBreakdown.chat += calculateChatCost(metric.chat_tokens);
    usage.costBreakdown.images += calculateImageCost(metric.image_generations);
    usage.costBreakdown.audio += calculateAudioCost(metric.audio_minutes);
    usage.costBreakdown.embeddings += calculateEmbeddingCost(metric.embedding_tokens);

    // Add to history
    usage.history.push({
      timestamp: metric.timestamp,
      chat: metric.chat_tokens || 0,
      images: metric.image_generations || 0,
      audio: metric.audio_minutes || 0,
      embeddings: metric.embedding_tokens || 0
    });
  });

  // Calculate total
  usage.total = usage.chat + usage.images + usage.audio + usage.embeddings;

  return usage;
};

/**
 * Calculate cost for chat tokens
 * @param {number} tokens - Number of tokens used
 * @returns {number} Cost in USD
 */
const calculateChatCost = (tokens) => {
  const COST_PER_1K_TOKENS = 0.002; // $0.002 per 1K tokens
  return (tokens / 1000) * COST_PER_1K_TOKENS;
};

/**
 * Calculate cost for image generations
 * @param {number} generations - Number of images generated
 * @returns {number} Cost in USD
 */
const calculateImageCost = (generations) => {
  const COST_PER_IMAGE = 0.016; // $0.016 per image
  return generations * COST_PER_IMAGE;
};

/**
 * Calculate cost for audio processing
 * @param {number} minutes - Minutes of audio processed
 * @returns {number} Cost in USD
 */
const calculateAudioCost = (minutes) => {
  const COST_PER_MINUTE = 0.006; // $0.006 per minute
  return minutes * COST_PER_MINUTE;
};

/**
 * Calculate cost for embeddings
 * @param {number} tokens - Number of tokens used
 * @returns {number} Cost in USD
 */
const calculateEmbeddingCost = (tokens) => {
  const COST_PER_1K_TOKENS = 0.0004; // $0.0004 per 1K tokens
  return (tokens / 1000) * COST_PER_1K_TOKENS;
};

/**
 * Format cost for display
 * @param {number} cost - Cost in USD
 * @returns {string} Formatted cost string
 */
export const formatCost = (cost) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  }).format(cost);
};

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Group metrics by time period
 * @param {Array} metrics - Array of metric objects
 * @param {string} period - Time period ('hour'|'day'|'week'|'month')
 * @returns {Object} Grouped metrics
 */
export const groupMetricsByPeriod = (metrics, period = 'day') => {
  return metrics.reduce((groups, metric) => {
    const date = new Date(metric.timestamp);
    let key;

    switch (period) {
      case 'hour':
        key = date.toISOString().slice(0, 13);
        break;
      case 'day':
        key = date.toISOString().slice(0, 10);
        break;
      case 'week':
        const week = Math.floor(date.getDate() / 7);
        key = `${date.getFullYear()}-W${week}`;
        break;
      case 'month':
        key = date.toISOString().slice(0, 7);
        break;
      default:
        key = date.toISOString().slice(0, 10);
    }

    if (!groups[key]) {
      groups[key] = {
        chat: 0,
        images: 0,
        audio: 0,
        embeddings: 0,
        total: 0
      };
    }

    groups[key].chat += metric.chat_tokens || 0;
    groups[key].images += metric.image_generations || 0;
    groups[key].audio += metric.audio_minutes || 0;
    groups[key].embeddings += metric.embedding_tokens || 0;
    groups[key].total = groups[key].chat + groups[key].images + 
                       groups[key].audio + groups[key].embeddings;

    return groups;
  }, {});
}; 
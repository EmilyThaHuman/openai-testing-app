import { format, formatDistance, formatRelative, subDays, subMonths } from 'date-fns';

/**
 * Get the start date for a given time range
 * @param {string} timeRange - The time range ('24h'|'7d'|'30d'|'90d')
 * @returns {Date} The start date for the range
 */
export const getTimeRangeDate = (timeRange) => {
  const now = new Date();
  
  switch (timeRange) {
    case '24h':
      return subDays(now, 1);
    case '7d':
      return subDays(now, 7);
    case '30d':
      return subDays(now, 30);
    case '90d':
      return subDays(now, 90);
    case '6m':
      return subMonths(now, 6);
    case '1y':
      return subMonths(now, 12);
    default:
      return subDays(now, 7); // Default to 7 days
  }
};

/**
 * Format a date relative to now
 * @param {Date|string} date - The date to format
 * @returns {string} The formatted relative time
 */
export const formatRelativeTime = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

/**
 * Format a date for display
 * @param {Date|string} date - The date to format
 * @param {string} formatStr - The format string (default: 'PPpp')
 * @returns {string} The formatted date
 */
export const formatDate = (date, formatStr = 'PPpp') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
};

/**
 * Format a date relative to a base date
 * @param {Date|string} date - The date to format
 * @param {Date} baseDate - The base date to format relative to
 * @returns {string} The formatted relative date
 */
export const formatRelativeDate = (date, baseDate = new Date()) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatRelative(dateObj, baseDate);
};

/**
 * Get time ranges for filtering
 * @returns {Array<{label: string, value: string}>} Array of time range options
 */
export const getTimeRanges = () => [
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last 6 months', value: '6m' },
  { label: 'Last year', value: '1y' }
];

/**
 * Check if a date is within a time range
 * @param {Date|string} date - The date to check
 * @param {string} timeRange - The time range to check against
 * @returns {boolean} Whether the date is within the range
 */
export const isWithinTimeRange = (date, timeRange) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const rangeStart = getTimeRangeDate(timeRange);
  return dateObj >= rangeStart;
};

/**
 * Group dates by period
 * @param {Array<{date: Date|string, [key: string]: any}>} items - Array of items with dates
 * @param {string} period - The period to group by ('day'|'week'|'month')
 * @returns {Object} Grouped items by period
 */
export const groupByPeriod = (items, period = 'day') => {
  return items.reduce((groups, item) => {
    const date = typeof item.date === 'string' ? new Date(item.date) : item.date;
    let key;

    switch (period) {
      case 'day':
        key = format(date, 'yyyy-MM-dd');
        break;
      case 'week':
        key = format(date, 'yyyy-[W]ww');
        break;
      case 'month':
        key = format(date, 'yyyy-MM');
        break;
      default:
        key = format(date, 'yyyy-MM-dd');
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}; 
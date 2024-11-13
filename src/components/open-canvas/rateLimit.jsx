'use server';
import { REACT_AGENT_CONFIG } from '@/config/ai/agent';

// In-memory rate limit store
const rateLimitStore = new Map();

function getTimestampMinutes() {
  return Math.floor(Date.now() / 60000); // Current time in minutes
}

function cleanOldEntries(currentTime) {
  // Remove outdated entries in the rate limit store to free memory
  rateLimitStore.forEach((entry, ip) => {
    entry.requests = entry.requests.filter(
      timestamp => currentTime - timestamp < 10
    ); // Keep only recent requests
    if (entry.requests.length === 0) rateLimitStore.delete(ip);
  });
}

// Check and update rate limit for a given IP
function checkAndUpdateRateLimit(ip) {
  const currentTime = getTimestampMinutes();
  cleanOldEntries(currentTime);

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { requests: [] });
  }

  const requestLog = rateLimitStore.get(ip);
  requestLog.requests.push(currentTime);

  // Count requests within the last 10 minutes
  const recentRequests = requestLog.requests.filter(
    timestamp => currentTime - timestamp < 10
  );

  rateLimitStore.set(ip, { requests: recentRequests });

  // Return true if the request count exceeds the limit (10 requests per 10 minutes)
  return recentRequests.length <= 10;
}

export async function checkRateLimit(streamable) {
  if (REACT_AGENT_CONFIG.useRateLimiting) {
    const identifier =
      // headers().get('x-forwarded-for') ||
      // headers().get('x-real-ip') ||
      // headers().get('cf-connecting-ip') ||
      // headers().get('client-ip') ||
      '';

    const isAllowed = checkAndUpdateRateLimit(identifier);
    if (!isAllowed) {
      streamable.done({ status: 'rateLimitReached' });
      return false;
    }
  }
  return true;
}

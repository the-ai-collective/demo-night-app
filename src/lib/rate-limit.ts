import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "~/env";

// Create Redis client for rate limiting
const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

/**
 * Rate limiter for general API endpoints
 * 100 requests per 10 seconds per IP
 */
export const generalRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

/**
 * Rate limiter for auth/token endpoints (more strict)
 * 10 requests per minute per IP to prevent brute force
 */
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/auth",
});

/**
 * Rate limiter for mutation endpoints (submissions, votes, etc.)
 * 30 requests per minute per IP
 */
export const mutationRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/mutation",
});

/**
 * Rate limiter for email sending
 * 5 emails per hour per IP
 */
export const emailRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "3600 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/email",
});

/**
 * Helper function to get client identifier from request
 */
export function getClientIdentifier(headers: Headers): string {
  // Try to get real IP from various headers (for proxies/load balancers)
  const forwardedFor = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const cfConnectingIp = headers.get("cf-connecting-ip");

  const ip = cfConnectingIp ?? realIp ?? forwardedFor?.split(",")[0] ?? "unknown";
  return ip.trim();
}

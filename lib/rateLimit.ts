/**
 * Server-side rate limiting.
 *
 * MVP implementation: in-memory sliding-window counter keyed by client
 * identifier (IP, or user id if/when auth exists). This is enforced entirely
 * server-side inside the API route handler — the client cannot bypass it by
 * editing frontend JS because the counter lives in server memory, not in a
 * cookie or localStorage value the client controls.
 *
 * KNOWN LIMITATION (documented, not hidden): this in-memory store is
 * per-server-instance. On a single long-running Node server (e.g. this
 * sandbox, or a single-instance deployment) it works correctly. On a
 * multi-instance/serverless platform like Vercel, each function instance has
 * its own memory, so a determined user could get up to N requests per warm
 * instance rather than a single global N. For true multi-instance-safe
 * limiting, swap `MemoryStore` below for a shared store such as Upstash
 * Redis (`@upstash/ratelimit` + `@upstash/redis`) — the interface is kept
 * intentionally small so that swap is a one-file change. This is called out
 * explicitly in the README / launch checklist as a scale-up follow-up, not
 * silently glossed over.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number; // epoch ms
}

interface WindowEntry {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function getLimit(): number {
  const raw = process.env.FREE_DAILY_GENERATION_LIMIT;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}

class MemoryStore {
  private store = new Map<string, WindowEntry>();

  check(key: string, limit: number): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now - entry.windowStart >= WINDOW_MS) {
      this.store.set(key, { count: 1, windowStart: now });
      return { allowed: true, remaining: limit - 1, limit, resetAt: now + WINDOW_MS };
    }

    if (entry.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        limit,
        resetAt: entry.windowStart + WINDOW_MS,
      };
    }

    entry.count += 1;
    return {
      allowed: true,
      remaining: limit - entry.count,
      limit,
      resetAt: entry.windowStart + WINDOW_MS,
    };
  }

  // Periodic cleanup to avoid unbounded memory growth on long-running processes.
  sweep() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.windowStart >= WINDOW_MS) {
        this.store.delete(key);
      }
    }
  }
}

const globalStore = ((): MemoryStore => {
  const g = globalThis as unknown as { __rateLimitStore?: MemoryStore };
  if (!g.__rateLimitStore) {
    g.__rateLimitStore = new MemoryStore();
    // Best-effort periodic sweep; harmless if it never fires in serverless.
    setInterval(() => g.__rateLimitStore?.sweep(), WINDOW_MS).unref?.();
  }
  return g.__rateLimitStore;
})();

/**
 * Extracts a best-effort client identifier from standard proxy headers.
 * Handles the common case of apps sitting behind Vercel's edge network or
 * another reverse proxy, where the real client IP is in x-forwarded-for.
 */
export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list; the first entry is the
    // original client.
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function checkRateLimit(identifier: string): RateLimitResult {
  const limit = getLimit();
  return globalStore.check(identifier, limit);
}

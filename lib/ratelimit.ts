// Per-IP rate limiter — in-memory for MVP. Swap for @upstash/ratelimit when
// scaling beyond a single Vercel region.
//
// Usage:
//   const limited = checkRateLimit(ip, "agent.extract", 5, 3600_000);
//   if (limited) return new Response("Too many requests", { status: 429 });

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodically prune expired buckets so memory doesn't grow without bound.
let lastPrune = 0;
function pruneIfStale(now: number) {
  if (now - lastPrune < 60_000) return;
  lastPrune = now;
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
}

export function checkRateLimit(
  ip: string,
  scope: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  pruneIfStale(now);
  const key = `${scope}:${ip}`;
  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count += 1;
  const allowed = b.count <= limit;
  return { allowed, remaining: Math.max(0, limit - b.count), resetAt: b.resetAt };
}

export function getRequestIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

// Pre-configured limit profiles for the agent endpoints (per plan).
export const LIMITS = {
  extract: { limit: 5, windowMs: 60 * 60_000 },
  generate: { limit: 10, windowMs: 60 * 60_000 },
  score: { limit: 30, windowMs: 60 * 60_000 },
  regenerate: { limit: 20, windowMs: 60 * 60_000 },
  newsletter: { limit: 5, windowMs: 60 * 60_000 },
  sheetsWrite: { limit: 60, windowMs: 60_000 }, // 1/sec average — gentle
} as const;

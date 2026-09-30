import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

// Per-user limits backed by the consume_rate_limit() Postgres function, so they hold across
// serverless instances. Buckets and limits live here in one place.

export const RATE_LIMITS = {
  /** Saved optimizer runs. A full run takes ~20s, so 30/10min is generous for humans. */
  pingRuns: { bucket: "ping_runs", max: 30, windowSeconds: 600, failOpen: true },
} as const;

type Limit = (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS];
export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

export async function consumeRateLimit(supabase: SupabaseClient, limit: Limit): Promise<RateLimitResult> {
  const { data, error } = await supabase
    .rpc("consume_rate_limit", { p_bucket: limit.bucket, p_max: limit.max, p_window_seconds: limit.windowSeconds })
    .single<{ allowed: boolean; remaining: number; retry_after_seconds: number }>();

  if (error || !data) {
    // failOpen: availability matters more than the limit (e.g. saving results).
    // failClosed: the limit protects something costly or abusable.
    logger.warn("rate_limit.unavailable", { bucket: limit.bucket, failOpen: limit.failOpen, message: error?.message });
    return limit.failOpen ? { allowed: true, remaining: limit.max, retryAfterSeconds: 0 } : { allowed: false, remaining: 0, retryAfterSeconds: 60 };
  }

  return { allowed: data.allowed, remaining: data.remaining, retryAfterSeconds: data.retry_after_seconds };
}

export function rateLimitResponse(result: RateLimitResult, message = "Too many requests. Please try again later.") {
  return Response.json(
    { success: false, error: message, retryAfterSeconds: result.retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
  );
}

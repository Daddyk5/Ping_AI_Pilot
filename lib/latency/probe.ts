// Browser-side latency probe. Runs in the user's browser so it measures THEIR network path.
//
// Method: one discarded warm-up request (absorbs DNS + TCP + TLS setup), then N timed
// `no-cors` GET requests over the kept-alive connection. On a warm connection, time to
// response headers ≈ one network round trip + a small server processing time. This is an
// HTTP round-trip time, not ICMP ping; it usually reads a few ms higher than in-game ping.

import type { Sample } from "@/lib/latency/stats";

export type ProbeOptions = {
  samples: number;
  timeoutMs?: number;
  gapMs?: number;
  signal?: AbortSignal;
  onSample?: (sample: Sample, index: number) => void;
};

export const DEFAULT_SAMPLES = 10;
const DEFAULT_TIMEOUT_MS = 2_000;
const DEFAULT_GAP_MS = 60;

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });

/** Times a single request. Returns ms, or null if it failed or timed out. Throws only if `signal` aborts. */
export async function timeRequest(url: string, timeoutMs: number, signal?: AbortSignal): Promise<Sample> {
  const controller = new AbortController();
  const onAbort = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", onAbort, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException("Timeout", "TimeoutError")), timeoutMs);

  // Unique query string defeats any intermediary cache without breaking connection reuse.
  const target = `${url}${url.includes("?") ? "&" : "?"}r=${Math.random().toString(36).slice(2)}`;
  const started = performance.now();

  try {
    const response = await fetch(target, {
      mode: "no-cors",
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
    });
    const elapsed = Math.round((performance.now() - started) * 10) / 10;
    // Drain the body (outside the timed window) so the connection is released for reuse;
    // otherwise the next request may open a fresh connection and pay a TLS handshake.
    await response.arrayBuffer().catch(() => undefined);
    return elapsed;
  } catch (error) {
    if (signal?.aborted) throw error;
    return null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

export async function probeTarget(url: string, options: ProbeOptions): Promise<Sample[]> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const gapMs = options.gapMs ?? DEFAULT_GAP_MS;

  // Warm-up: establishes the connection; its (much slower) time is discarded.
  await timeRequest(url, timeoutMs * 2, options.signal);
  await sleep(gapMs, options.signal);

  const samples: Sample[] = [];
  for (let i = 0; i < options.samples; i++) {
    const sample = await timeRequest(url, timeoutMs, options.signal);
    samples.push(sample);
    options.onSample?.(sample, i);
    if (i < options.samples - 1) await sleep(gapMs, options.signal);
  }
  return samples;
}

/** Network Information API hint ("4g", "wifi"…). Only some browsers expose it. */
export function getConnectionType(): string | undefined {
  const connection = (navigator as Navigator & { connection?: { type?: string; effectiveType?: string } }).connection;
  return connection?.type ?? connection?.effectiveType;
}

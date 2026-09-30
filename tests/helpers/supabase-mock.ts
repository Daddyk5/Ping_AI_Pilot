import { vi } from "vitest";

type Result = { data?: unknown; error?: { message: string } | null };

/**
 * Minimal chainable stand-in for a Supabase query builder. Every builder method returns
 * the same chain; awaiting the chain (or calling .single()) resolves to `result`. Pass an array
 * to return a different result per query, in order (the last one repeats).
 * `calls` records each method call so tests can assert on filters.
 */
export function createQueryMock(result: Result | Result[] = { data: [], error: null }) {
  const queue = Array.isArray(result) ? [...result] : [result];
  const next = () => (queue.length > 1 ? queue.shift()! : queue[0]);
  const calls: Array<[string, unknown[]]> = [];
  const chain: Record<string, unknown> = {};

  for (const method of ["select", "insert", "delete", "eq", "not", "order", "limit", "gte", "upsert", "maybeSingle"]) {
    chain[method] = vi.fn((...args: unknown[]) => {
      calls.push([method, args]);
      return chain;
    });
  }
  chain.single = vi.fn(async () => next());
  chain.then = (resolve: (value: Result) => unknown) => Promise.resolve(next()).then(resolve);

  const client = { from: vi.fn(() => chain) };
  return { client, calls };
}

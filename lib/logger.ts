import "server-only";

import * as Sentry from "@sentry/nextjs";

// Structured JSON-line logging. Vercel captures stdout/stderr and each line is searchable
// by field (e.g. `event:ping_run.saved`). Never log secrets, tokens, or raw emails.

type Level = "debug" | "info" | "warn" | "error";
type Fields = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack?.split("\n").slice(0, 5).join("\n") };
  }
  return { message: String(error) };
}

function write(level: Level, event: string, fields: Fields = {}) {
  if (level === "error") {
    // Handled errors never reach Next's onRequestError hook, so report them explicitly.
    const { error, ...context } = fields;
    Sentry.captureException(error instanceof Error ? error : new Error(event), { tags: { event }, extra: context });
  }

  const entry: Fields = { level, event, time: new Date().toISOString(), ...fields };
  if ("error" in entry) entry.error = serializeError(entry.error);
  const line = JSON.stringify(entry);

  if (level === "error" || level === "warn") {
    console.error(line);
  } else if (level !== "debug" || process.env.NODE_ENV !== "production") {
    console.log(line);
  }
}

export const logger = {
  debug: (event: string, fields?: Fields) => write("debug", event, fields),
  info: (event: string, fields?: Fields) => write("info", event, fields),
  warn: (event: string, fields?: Fields) => write("warn", event, fields),
  error: (event: string, fields?: Fields) => write("error", event, fields),
};

/** Wraps a route handler body with timing + request id, and logs unhandled errors. */
export function withRequestLog<T>(route: string, userId: string | null, fn: (log: typeof logger & { requestId: string }) => Promise<T>) {
  const requestId = crypto.randomUUID();
  const started = performance.now();
  const bound = {
    requestId,
    debug: (event: string, fields?: Fields) => logger.debug(event, { route, requestId, userId, ...fields }),
    info: (event: string, fields?: Fields) => logger.info(event, { route, requestId, userId, ...fields }),
    warn: (event: string, fields?: Fields) => logger.warn(event, { route, requestId, userId, ...fields }),
    error: (event: string, fields?: Fields) => logger.error(event, { route, requestId, userId, ...fields }),
  };

  return fn(bound).finally(() => {
    bound.debug("request.completed", { durationMs: Math.round(performance.now() - started) });
  });
}

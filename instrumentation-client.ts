import * as Sentry from "@sentry/nextjs";
import { SENTRY_DATA_COLLECTION, SENTRY_TRACES_SAMPLE_RATE } from "@/lib/sentry-options";

// Browser error monitoring. NEXT_PUBLIC_SENTRY_DSN must be referenced literally so Next.js
// inlines it at build time. No-op until it is set.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
  dataCollection: SENTRY_DATA_COLLECTION,
  // Browser extensions and aborted fetches (user pressed Stop in the optimizer) are noise.
  ignoreErrors: ["AbortError", "ResizeObserver loop limit exceeded"],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

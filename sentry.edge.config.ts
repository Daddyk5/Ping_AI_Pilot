import * as Sentry from "@sentry/nextjs";
import { SENTRY_DATA_COLLECTION, SENTRY_TRACES_SAMPLE_RATE } from "@/lib/sentry-options";

// Edge runtime error monitoring. No-op until SENTRY_DSN is set.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
  dataCollection: SENTRY_DATA_COLLECTION,
});

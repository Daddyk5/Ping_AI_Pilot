"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

// Last-resort boundary: replaces the root layout, so it brings its own <html>/<body> and styles.
// Most errors are caught earlier by app/error.tsx, inside the normal app shell.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh">
        <main className="grid min-h-dvh place-items-center px-5">
          <div className="max-w-sm text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-fg">Something went wrong</h1>
            <p className="mt-2 text-sm leading-6 text-fg-3">PingPilot hit an unexpected error. It&apos;s been reported. Try again, or reload the page.</p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-ink hover:bg-accent-strong"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}

"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <main className="grid min-h-screen place-items-center px-4">
          <section className="w-full max-w-md rounded-lg border border-red-400/30 bg-red-500/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-200">App recovery</p>
            <h1 className="mt-3 text-2xl font-semibold text-zinc-50">PingPilot hit a client-side error.</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              The app caught the failure before it could leave you on a blank screen. Try reloading the current view.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 inline-flex h-10 items-center justify-center rounded border border-red-200/40 bg-red-200/10 px-4 text-sm font-semibold text-red-100 transition hover:bg-red-200/20"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}

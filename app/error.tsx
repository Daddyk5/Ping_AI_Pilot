"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";

// Route-level error boundary: renders inside the app shell, so navigation keeps working.
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="grid min-h-[60dvh] place-items-center px-5">
      <div className="max-w-sm text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-red-300/25 bg-danger-soft text-danger">
          <TriangleAlert className="size-7" aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-fg">This page hit a problem</h1>
        <p className="mt-2 text-sm leading-6 text-fg-3">It&apos;s been reported automatically. Your saved tests are safe.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={reset}>
            <RotateCcw aria-hidden />
            Try again
          </Button>
          <ButtonLink href="/dashboard" variant="secondary">
            Dashboard
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

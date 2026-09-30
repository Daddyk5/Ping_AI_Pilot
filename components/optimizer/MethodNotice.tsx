import { ChevronDown, Info } from "lucide-react";

/** Plain-language disclosure of what the optimizer actually measures. Keep this honest. */
export function MethodNotice() {
  return (
    <details className="group mt-6 border-t border-line pt-4 text-sm text-fg-3">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-2 font-medium text-fg-2 hover:text-fg [&::-webkit-details-marker]:hidden">
        <Info className="size-4 text-accent" aria-hidden />
        How is this measured?
        <ChevronDown className="size-4 transition group-open:rotate-180" aria-hidden />
      </summary>
      <div className="mt-3 max-w-3xl space-y-2 leading-6">
        <p>
          Browsers can&apos;t send ICMP pings or talk to game servers directly. Instead, your browser times small HTTPS requests to a cloud
          endpoint (AWS) in, or near, the city where each game hosts that region. After one warm-up request, each timed request takes about one
          network round trip, so the numbers track your real route quality to that city.
        </p>
        <p>
          Expect in-game ping to differ by a few milliseconds, more for regions marked <em>nearby</em> (no endpoint in the exact city) or when a game
          uses its own routing network. &ldquo;Failed&rdquo; requests are timeouts or errors, a rough sign of instability rather than true packet
          loss. Server locations are based on public information and can change.
        </p>
      </div>
    </details>
  );
}

import { Info } from "lucide-react";

/** Plain-language disclosure of what the optimizer actually measures. Keep this honest. */
export function MethodNotice() {
  return (
    <details className="group rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm text-zinc-400">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-zinc-200">
        <Info className="h-4 w-4 text-cyan-200" aria-hidden />
        What this measures: HTTP round-trip time from your browser, not in-game ping
        <span className="ml-auto text-xs text-zinc-500 group-open:hidden">Details</span>
      </summary>
      <div className="mt-3 space-y-2 leading-6">
        <p>
          Browsers can&apos;t send ICMP pings or talk to game servers directly. Instead, your browser times small HTTPS requests
          to a cloud endpoint (AWS) located in, or near, the city where each game hosts that region. After one warm-up request,
          each timed request takes about one network round trip, so the numbers track your real route quality to that city.
        </p>
        <p>
          Expect in-game ping to differ by a few milliseconds, more when a region is marked <em>nearby</em> (no endpoint in the
          exact city) or when the game uses its own routing network. &ldquo;Failed requests&rdquo; are timeouts or errors, a rough
          signal of instability, not a true packet-loss measurement.
        </p>
        <p>Server locations are based on publicly available information and can change.</p>
      </div>
    </details>
  );
}

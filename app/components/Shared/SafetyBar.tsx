import { ShieldAlert } from "lucide-react";

export function SafetyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-yellow-300/30 bg-yellow-300 px-4 py-2 text-black shadow-[0_-8px_28px_rgba(250,204,21,0.18)]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-center text-xs font-bold uppercase tracking-[0.16em] sm:text-sm">
        <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />
        PingPilot AI observes network telemetry only. It does not boost, tunnel, spoof, or promise a fix.
      </div>
    </div>
  );
}

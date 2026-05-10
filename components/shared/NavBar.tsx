import { Activity, RadioTower } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Badge } from "@/components/ui/Badge";

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090b]/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded border border-cyan-300/35 bg-cyan-300/10 shadow-[0_0_22px_rgba(0,243,255,0.18)]">
            <RadioTower className="h-5 w-5 text-cyan-200" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-100">PingPilot AI</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Lead Flight Engineer</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="green" className="hidden sm:inline-flex">
            <Activity className="mr-1 h-3 w-3" aria-hidden />
            Telemetry Live
          </Badge>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}

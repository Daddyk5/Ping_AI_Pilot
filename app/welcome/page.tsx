import Link from "next/link";
import { Activity, ArrowRight, Gauge, Radar, ShieldCheck, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const signals = [
  { label: "Latency", value: "38ms", icon: Gauge },
  { label: "Jitter", value: "7ms", icon: Activity },
  { label: "Best Region", value: "Singapore", icon: Radar },
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/welcome" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded border border-cyan-300/35 bg-cyan-300/10 shadow-[0_0_22px_rgba(0,243,255,0.18)]">
            <Radar className="h-5 w-5 text-cyan-200" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-100">PingPilot AI</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Latency Analyzer</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-cyan-300/40 hover:text-cyan-100"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded border border-cyan-300/50 bg-cyan-300/15 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_18px_rgba(0,243,255,0.18)] transition hover:bg-cyan-300/25"
          >
            Register
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8">
        <div>
          <Badge tone="green">Observer Mode Active</Badge>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
            Find the fastest server for your game.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
            Test Dota 2, MLBB, Delta Force, CS2 and League of Legends server regions from your own connection. Get a clear recommendation, practical suggestions, and a history of your connection quality over time.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center gap-2 rounded border border-cyan-300/50 bg-cyan-300/15 px-5 text-sm font-semibold text-cyan-100 shadow-[0_0_18px_rgba(0,243,255,0.18)] transition hover:bg-cyan-300/25"
            >
              Login to Dashboard
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center gap-2 rounded border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-zinc-300 transition hover:border-cyan-300/40 hover:text-cyan-100"
            >
              Create Account
              <UserPlus className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-8 flex items-start gap-3 rounded border border-yellow-300/30 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-100">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            PingPilot AI never changes DNS, firewall, registry, router, or system network settings.
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-zinc-950/70 p-5 shadow-[0_0_32px_rgba(0,243,255,0.08)] backdrop-blur-md">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Example result</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-50">Dota 2 · SE Asia</h2>
            </div>
            <Badge tone="neutral">Sample data</Badge>
          </div>
          <div className="grid gap-3">
            {signals.map((signal) => {
              const Icon = signal.icon;

              return (
                <div key={signal.label} className="flex items-center justify-between rounded border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-cyan-200" aria-hidden />
                    <span className="text-sm text-zinc-400">{signal.label}</span>
                  </div>
                  <span className="font-mono text-lg text-cyan-100 ping-glow">{signal.value}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded border border-white/10 bg-black/40 p-4 font-mono text-xs leading-6 text-zinc-400">
            Measured as HTTPS round-trip time from your browser to each region, a close proxy for in-game ping. We tell you exactly what we measure.
          </div>
        </div>
      </section>
    </div>
  );
}

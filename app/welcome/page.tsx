import { ArrowRight, BarChart3, Gauge, Home, Lightbulb, MousePointerClick, ShieldCheck, Sparkles } from "lucide-react";
import { GameBadge } from "@/components/games/GameBadge";
import { Logo } from "@/components/shared/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GAMES, isTestableGame } from "@/lib/games/catalog";

// Clearly labelled example data for the hero preview. Not a real measurement.
const SAMPLE = [
  { region: "SE Asia", ms: 38, best: true },
  { region: "Hong Kong", ms: 61 },
  { region: "Japan", ms: 84 },
  { region: "India", ms: 97 },
  { region: "Australia", ms: 142 },
];
const SAMPLE_MAX = 150;

const STEPS = [
  { icon: MousePointerClick, title: "Pick your game", body: "Dota 2, MLBB, Delta Force, CS2, League of Legends, or any custom server." },
  { icon: Gauge, title: "We test every region", body: "Your browser measures each server region from your own connection in about 20 seconds." },
  { icon: Lightbulb, title: "Play on the best one", body: "Get a clear recommendation, plus tips when your connection has problems like evening lag." },
];

const TRUST = [
  { icon: Home, title: "Measured from your connection", body: "Tests run in your browser, so the results reflect your home network and ISP, not ours." },
  { icon: BarChart3, title: "Real numbers only", body: "Every result is a live measurement. Unreachable servers say so; we never fill gaps with estimates." },
  { icon: ShieldCheck, title: "Never touches your settings", body: "PingPilot only measures and advises. No DNS, router, firewall or system changes, ever." },
];

export default function WelcomePage() {
  const games = GAMES.filter(isTestableGame);

  return (
    <div className="overflow-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo href="/welcome" />
        <nav className="flex items-center gap-2">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Log in
          </ButtonLink>
          <ButtonLink href="/register" size="sm">
            Get started
          </ButtonLink>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
        <div className="animate-rise">
          <Badge tone="accent" dot>
            Free · runs in your browser · no downloads
          </Badge>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-6xl">
            Find the fastest server for <span className="bg-gradient-to-r from-accent to-emerald-300 bg-clip-text text-transparent">your game.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-fg-2">
            Test every server region from your own connection, get a clear recommendation, and see how your ping holds up over time.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/register" size="lg">
              Test my connection
              <ArrowRight aria-hidden />
            </ButtonLink>
            <ButtonLink href="/login" variant="secondary" size="lg">
              I have an account
            </ButtonLink>
          </div>
          <div className="mt-10">
            <p className="text-xs font-medium text-fg-3">Supported games</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {games.map((game) => (
                <li key={game.id} className="flex items-center gap-2 rounded-full border border-line bg-surface/70 py-1 pl-1 pr-3 text-sm text-fg-2">
                  <GameBadge game={game} size="sm" className="size-6 rounded-full text-[9px]" />
                  {game.shortName}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Product preview (example data) */}
        <div className="relative animate-rise [animation-delay:120ms]">
          <div aria-hidden className="absolute -inset-10 -z-10 rounded-full bg-accent/10 blur-3xl" />
          <div className="rounded-3xl border border-line-strong bg-surface/90 p-5 shadow-card sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <GameBadge game={games[0]} size="md" />
                <div>
                  <p className="text-sm font-semibold text-fg">Dota 2 · region test</p>
                  <p className="text-xs text-fg-3">5 regions · 10 requests each</p>
                </div>
              </div>
              <Badge>Example</Badge>
            </div>

            <div className="mt-5 rounded-2xl border border-accent/25 bg-accent-soft p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
                <Sparkles className="size-3.5" aria-hidden />
                Recommended
              </p>
              <div className="mt-1 flex items-end justify-between">
                <p className="text-xl font-semibold text-fg">SE Asia</p>
                <p className="tabular text-3xl font-semibold text-fg">
                  38<span className="ml-1 text-base font-medium text-fg-3">ms</span>
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-2.5" aria-label="Example results">
              {SAMPLE.map((row) => (
                <li key={row.region} className="grid grid-cols-[92px_1fr_52px] items-center gap-3 text-sm">
                  <span className="truncate text-fg-2">{row.region}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-white/5">
                    <span className={`block h-full rounded-full ${row.best ? "bg-accent" : "bg-white/20"}`} style={{ width: `${(row.ms / SAMPLE_MAX) * 100}%` }} />
                  </span>
                  <span className="tabular text-right font-mono text-fg">{row.ms} ms</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-surface/40">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-fg">How it works</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-fg-3">Three steps, about a minute, no installs.</p>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative rounded-2xl border border-line bg-surface p-6">
                <span className="absolute right-5 top-5 text-sm font-semibold text-fg-3">0{index + 1}</span>
                <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
                  <step.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-fg">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-fg-3">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-fg">Honest by design</h2>
            <p className="mt-4 leading-7 text-fg-3">
              Browsers can&apos;t ping game servers directly, so PingPilot times secure requests to a cloud server in the same city as each game&apos;s
              servers. That tracks your in-game ping closely, and we show you exactly how it&apos;s measured.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {TRUST.map((item) => (
              <li key={item.title} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                <item.icon className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                <div>
                  <h3 className="font-semibold text-fg">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-fg-3">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/15 via-surface to-surface p-8 text-center sm:p-14">
          <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">Stop guessing your server.</h2>
          <p className="mx-auto mt-3 max-w-md text-fg-2">Create a free account and run your first test in under a minute.</p>
          <ButtonLink href="/register" size="lg" className="mt-8">
            Get started free
            <ArrowRight aria-hidden />
          </ButtonLink>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-fg-3 sm:flex-row sm:px-8">
          <Logo href="/welcome" />
          <p>Measures and advises only. Never changes your network settings.</p>
        </div>
      </footer>
    </div>
  );
}

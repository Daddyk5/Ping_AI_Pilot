import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { GameBadge } from "@/components/games/GameBadge";
import { Logo } from "@/components/shared/Logo";
import { GAMES, isTestableGame } from "@/lib/games/catalog";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

const POINTS = ["Test every server region from your own connection", "Get a clear recommended region in about 20 seconds", "Track your connection quality over time"];

/** Auth layout: brand panel (desktop) + form. The form column is the whole page on mobile. */
export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
      <aside className="relative hidden overflow-hidden border-r border-line lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="absolute -left-40 top-1/3 size-[36rem] rounded-full bg-accent/10 blur-3xl" />
        <Logo href="/welcome" />
        <div className="relative max-w-lg">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-fg">
            Find the fastest server for <span className="text-accent">your</span> game.
          </h2>
          <ul className="mt-8 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-fg-2">
                <span className="grid size-6 place-items-center rounded-full bg-accent-soft text-accent">
                  <Check className="size-3.5" aria-hidden />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex gap-2">
            {GAMES.filter(isTestableGame).map((game) => (
              <GameBadge key={game.id} game={game} size="md" />
            ))}
          </div>
        </div>
        <p className="relative text-xs text-fg-3">PingPilot never changes your DNS, router or system settings.</p>
      </aside>

      <div className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Logo href="/welcome" className="mb-10 lg:hidden" />
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-fg-3">{description}</p>
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-8 text-center text-sm text-fg-3">{footer}</p>}
        </div>
      </div>
    </div>
  );
}

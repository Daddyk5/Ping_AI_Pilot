import Link from "next/link";
import { cn } from "@/lib/utils";

/** Radar mark: concentric arcs + a ping dot. Inline SVG so it's crisp and themeable. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid size-9 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent-soft", className)}>
      <svg viewBox="0 0 24 24" className="size-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M4.5 16.5a9 9 0 0 1 15 0" opacity="0.45" />
        <path d="M7.5 17.5a5.5 5.5 0 0 1 9 0" opacity="0.75" />
        <circle cx="12" cy="18" r="1.6" fill="currentColor" stroke="none" />
        <path d="M12 18 17.5 7" />
      </svg>
    </span>
  );
}

export function Logo({ href = "/", className, compact }: { href?: string; className?: string; compact?: boolean }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 rounded-lg", className)} aria-label="PingPilot AI home">
      <LogoMark />
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight text-fg">
          PingPilot <span className="text-accent">AI</span>
        </span>
      )}
    </Link>
  );
}

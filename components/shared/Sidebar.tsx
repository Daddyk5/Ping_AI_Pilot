"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Gauge, History, Radar, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/livetest", label: "Live Test", icon: Radar },
  { href: "/optimizer", label: "Optimizer", icon: Zap },
  { href: "/compare", label: "Compare", icon: BarChart3 },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-black/30 px-3 py-5 lg:block">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (pathname === "/" && item.href === "/dashboard");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded border border-transparent px-3 py-3 text-sm text-zinc-400 transition",
                active
                  ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100 shadow-[0_0_18px_rgba(0,243,255,0.1)]"
                  : "hover:border-white/10 hover:bg-white/[0.03] hover:text-zinc-100",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 rounded border border-white/10 bg-white/[0.03] p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Observer Mode</p>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Diagnostic output is advisory telemetry. Route changes remain under user control.
        </p>
      </div>
    </aside>
  );
}

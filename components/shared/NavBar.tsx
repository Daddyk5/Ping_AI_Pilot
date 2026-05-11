"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity, BarChart3, Gauge, History, Menu, RadioTower, Radar, Settings, UserCircle, X, Zap } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/livetest", label: "Live Test", icon: Radar },
  { href: "/optimizer", label: "Optimizer", icon: Zap },
  { href: "/compare", label: "Compare", icon: BarChart3 },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090b]/82 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <motion.div
            className="relative grid h-9 w-9 place-items-center rounded border border-cyan-300/35 bg-cyan-300/10 shadow-[0_0_22px_rgba(0,243,255,0.18)]"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.88 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <span className="ping-orbit ping-orbit-a" />
            <span className="ping-orbit ping-orbit-b" />
            <RadioTower className="h-5 w-5 text-cyan-200" aria-hidden />
          </motion.div>
          <div>
            <motion.p
              className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-100"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.24, ease: "easeOut" }}
            >
              PingPilot AI
            </motion.p>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Lead Flight Engineer</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative hidden h-10 w-10 place-items-center rounded border border-white/10 bg-white/[0.03] text-zinc-300 transition hover:border-cyan-300/40 hover:text-cyan-100 sm:grid"
            aria-label="Notifications"
          >
            <Activity className="h-4 w-4" aria-hidden />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(190,242,100,0.9)]" />
          </button>
          <button
            type="button"
            className="hidden h-10 w-10 place-items-center rounded border border-white/10 bg-white/[0.03] text-zinc-300 transition hover:border-cyan-300/40 hover:text-cyan-100 sm:grid"
            aria-label="Profile"
          >
            <UserCircle className="h-4 w-4" aria-hidden />
          </button>
          <Badge tone="green" className="hidden sm:inline-flex">
            <Activity className="mr-1 h-3 w-3" aria-hidden />
            Telemetry Live
          </Badge>
          <SignOutButton />
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-10 px-0 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="border-t border-white/10 bg-zinc-950/95 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:hidden"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const active = pathname === item.href || (pathname === "/" && item.href === "/dashboard");

                return (
                  <motion.div
                    key={item.href}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
                    animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.025, duration: 0.16 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded border px-3 py-3 text-sm transition",
                        active
                          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                          : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-100",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

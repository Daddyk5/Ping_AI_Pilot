"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, RadioTower, UserCircle, X } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { useSessionUser } from "@/components/shared/useSessionUser";
import { Button } from "@/components/ui/Button";
import { isActive, NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const sessionUser = useSessionUser();
  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || sessionUser?.isAdmin);

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
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Game ping optimizer</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="hidden items-center gap-2 rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300 transition hover:border-cyan-300/40 hover:text-cyan-100 sm:flex"
          >
            <UserCircle className="h-4 w-4" aria-hidden />
            <span className="max-w-40 truncate">{sessionUser?.displayName ?? sessionUser?.email ?? "Account"}</span>
          </Link>
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
                const active = isActive(pathname, item.href);

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

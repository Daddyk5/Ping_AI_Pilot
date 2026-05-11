"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
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
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.aside
      className="hidden w-64 shrink-0 border-r border-white/10 bg-black/30 px-3 py-5 backdrop-blur-xl lg:block"
      initial={shouldReduceMotion ? false : { opacity: 0, x: -14 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <nav className="space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = pathname === item.href || (pathname === "/" && item.href === "/dashboard");

          return (
            <motion.div
              key={item.href}
              initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ delay: index * 0.035, duration: 0.22, ease: "easeOut" }}
              whileHover={shouldReduceMotion ? undefined : { x: 4 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
            >
              <Link
                href={item.href}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded border border-transparent px-3 py-3 text-sm text-zinc-400 transition",
                active
                  ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100 shadow-[0_0_18px_rgba(0,243,255,0.1)]"
                  : "hover:border-white/10 hover:bg-white/[0.03] hover:text-zinc-100",
              )}
            >
              <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-cyan-200/10 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]" />
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-y-1 left-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(0,243,255,0.8)]"
                />
              )}
              <Icon className={cn("h-4 w-4 transition", active ? "text-cyan-100" : "group-hover:text-cyan-100")} aria-hidden />
              {item.label}
            </Link>
            </motion.div>
          );
        })}
      </nav>
      <motion.div
        className="mt-8 rounded-lg border border-white/10 bg-white/[0.03] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.28, ease: "easeOut" }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Observer Mode</p>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Diagnostic output is advisory telemetry. Route changes remain under user control.
        </p>
      </motion.div>
    </motion.aside>
  );
}

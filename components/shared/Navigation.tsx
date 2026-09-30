"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AccountMenu } from "@/components/shared/AccountMenu";
import { Logo } from "@/components/shared/Logo";
import { useSessionUser } from "@/components/shared/useSessionUser";
import { isActive, NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function useNavItems() {
  const user = useSessionUser();
  return NAV_ITEMS.filter((item) => !item.adminOnly || user?.isAdmin);
}

/** Desktop (lg+) left rail. */
export function Sidebar() {
  const pathname = usePathname();
  const items = useNavItems();

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-bg/60 px-3 py-4 backdrop-blur-xl lg:flex">
      <Logo href="/dashboard" className="mb-6 px-2" />
      <nav aria-label="Main" className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-accent-soft text-fg" : "text-fg-3 hover:bg-white/[0.04] hover:text-fg",
              )}
            >
              {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" aria-hidden />}
              <Icon className={cn("size-4", active ? "text-accent" : "text-fg-3 group-hover:text-fg-2")} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-line bg-surface p-3.5">
        <p className="flex items-center gap-2 text-xs font-semibold text-fg-2">
          <ShieldCheck className="size-3.5 text-success" aria-hidden />
          Observer mode
        </p>
        <p className="mt-1.5 text-xs leading-5 text-fg-3">PingPilot measures and advises. It never changes your network or system settings.</p>
      </div>
    </aside>
  );
}

/** Sticky top bar: logo on mobile, account menu everywhere. Page-level actions live in each PageHeader. */
export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/75 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Logo href="/dashboard" className="lg:hidden" />
        <div className="hidden lg:block" />
        <AccountMenu />
      </div>
    </header>
  );
}

/** Phone bottom tab bar (below lg). Admin lives in the account menu → settings on mobile. */
export function MobileTabBar() {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly);

  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          const primary = item.href === "/optimizer";
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition", active ? "text-accent" : "text-fg-3 hover:text-fg-2")}
            >
              <span className={cn("grid h-7 w-12 place-items-center rounded-full transition", active && "bg-accent-soft", primary && !active && "text-fg-2")}>
                <Icon className="size-[18px]" aria-hidden />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

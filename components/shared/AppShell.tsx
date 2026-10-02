"use client";

import { usePathname } from "next/navigation";
import { MobileTabBar, Sidebar, TopBar } from "@/components/shared/Navigation";

// Pages that render without the signed-in app chrome.
const BARE_ROUTES = new Set(["/", "/welcome", "/login", "/register", "/forgot-password", "/reset-password"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (BARE_ROUTES.has(pathname)) {
    return <main className="min-h-dvh">{children}</main>;
  }

  return (
    <div className="flex min-h-dvh">
      <a href="#main" className="sr-only z-50 rounded-lg bg-accent px-3 py-2 font-semibold text-accent-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        {/* Bottom padding keeps content clear of the mobile tab bar. */}
        <main id="main" key={pathname} className="w-full min-w-0 flex-1 animate-rise pb-24 lg:pb-10">
          {children}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, ShieldCheck } from "lucide-react";
import { useSessionUser } from "@/components/shared/useSessionUser";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

function initials(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function Avatar({ label, className }: { label: string | null | undefined; className?: string }) {
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent/80 to-emerald-300/70 text-xs font-bold text-accent-ink", className)} aria-hidden>
      {initials(label)}
    </span>
  );
}

export function AccountMenu() {
  const user = useSessionUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const label = user?.displayName ?? user?.email ?? null;

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  function signOut() {
    startSignOut(async () => {
      try {
        await createSupabaseBrowserClient()?.auth.signOut();
      } finally {
        router.replace("/welcome");
        router.refresh();
      }
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-line bg-surface-2 py-1 pl-1 pr-2 transition hover:border-line-strong"
      >
        <Avatar label={label} className="size-7" />
        <span className="hidden max-w-36 truncate text-sm text-fg-2 sm:block">{user?.displayName ?? user?.email ?? "Account"}</span>
        <ChevronDown className={cn("size-4 text-fg-3 transition", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 animate-rise rounded-xl border border-line-strong bg-surface-2 p-1.5 shadow-2xl">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-fg">{user?.displayName ?? "Signed in"}</p>
            {user?.email && <p className="truncate text-xs text-fg-3">{user.email}</p>}
          </div>
          <div className="my-1 h-px bg-line" />
          <Link role="menuitem" href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg-2 hover:bg-white/5 hover:text-fg">
            <Settings className="size-4" aria-hidden />
            Settings
          </Link>
          {user?.isAdmin && (
            <Link role="menuitem" href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg-2 hover:bg-white/5 hover:text-fg">
              <ShieldCheck className="size-4" aria-hidden />
              Admin
            </Link>
          )}
          <button role="menuitem" type="button" onClick={signOut} disabled={signingOut} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg-2 hover:bg-white/5 hover:text-fg disabled:opacity-50">
            <LogOut className="size-4" aria-hidden />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}

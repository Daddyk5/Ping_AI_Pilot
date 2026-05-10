"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase?.auth.signOut();
      } finally {
        router.replace("/welcome");
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={isPending}
      className="inline-flex h-9 items-center justify-center gap-2 rounded border border-white/10 bg-white/[0.03] px-3 text-xs font-semibold text-zinc-300 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:opacity-60"
    >
      <LogOut className="h-3.5 w-3.5" aria-hidden />
      {isPending ? "Signing out" : "Logout"}
    </button>
  );
}

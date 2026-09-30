import Link from "next/link";
import type { ReactNode } from "react";
import { Radar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type AuthCardProps = {
  badge: string;
  badgeTone: "cyan" | "green";
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ badge, badgeTone, title, description, children, footer }: AuthCardProps) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/welcome" className="mx-auto mb-6 flex w-fit items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded border border-cyan-300/35 bg-cyan-300/10 shadow-[0_0_22px_rgba(0,243,255,0.18)]">
            <Radar className="h-5 w-5 text-cyan-200" aria-hidden />
          </div>
          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-100">PingPilot AI</span>
        </Link>

        <Card className="p-6">
          <Badge tone={badgeTone}>{badge}</Badge>
          <h1 className="mt-4 text-2xl font-semibold text-zinc-50">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
          <div className="mt-6">{children}</div>
          {footer && <p className="mt-5 text-center text-sm text-zinc-500">{footer}</p>}
        </Card>
      </div>
    </div>
  );
}

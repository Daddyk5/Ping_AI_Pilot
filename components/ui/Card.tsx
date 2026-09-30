import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-line bg-surface/85 shadow-card backdrop-blur-sm", className)} {...props} />;
}

/** Card title row: sentence-case heading, optional description and right-aligned action. */
export function CardHeader({ title, description, action, icon, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-fg [&_svg]:size-4 [&_svg]:text-accent">
          {icon}
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-fg-3">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

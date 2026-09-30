import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-white/[0.06]", className)} aria-hidden />;
}

const ALERT = {
  info: { Icon: Info, className: "border-accent/25 bg-accent-soft text-fg-2 [&_svg]:text-accent" },
  success: { Icon: CircleCheck, className: "border-green-300/25 bg-success-soft text-green-100 [&_svg]:text-success" },
  warning: { Icon: TriangleAlert, className: "border-yellow-300/25 bg-warning-soft text-yellow-100 [&_svg]:text-warning" },
  error: { Icon: CircleAlert, className: "border-red-300/25 bg-danger-soft text-red-100 [&_svg]:text-danger" },
};

export function Alert({ tone = "info", title, children, action, className }: { tone?: keyof typeof ALERT; title?: ReactNode; children?: ReactNode; action?: ReactNode; className?: string }) {
  const { Icon, className: toneClass } = ALERT[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-xl border p-3.5 text-sm leading-6", toneClass, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold text-fg">{title}</p>}
        {children}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center", className)}>
      {icon && <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-line bg-surface-2 text-accent [&_svg]:size-6">{icon}</div>}
      <p className="text-base font-semibold text-fg">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-6 text-fg-3">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Page title block used at the top of every signed-in screen. */
export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-fg-3">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

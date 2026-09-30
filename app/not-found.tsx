import { Compass } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <div className="max-w-sm text-center">
        <Logo href="/" className="mx-auto mb-10 w-fit" />
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-line bg-surface-2 text-accent">
          <Compass className="size-7" aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-fg">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-fg-3">This page doesn&apos;t exist or has moved. Let&apos;s get you back on track.</p>
        <ButtonLink href="/dashboard" className="mt-8">
          Go to dashboard
        </ButtonLink>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Radar } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
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
          <Badge tone="cyan">Secure Access</Badge>
          <h1 className="mt-4 text-2xl font-semibold text-zinc-50">Login</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Enter your account details to return to the telemetry console.</p>

          <LoginForm />

          <p className="mt-5 text-center text-sm text-zinc-500">
            No account?{" "}
            <Link href="/register" className="font-semibold text-cyan-200 hover:text-cyan-100">
              Create one
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

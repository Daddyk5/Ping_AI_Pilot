import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthDivider, GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { LoginForm } from "@/components/auth/LoginForm";
import { CALLBACK_ERROR_MESSAGES, getSafeRedirectPath } from "@/lib/auth-shared";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = getSafeRedirectPath(typeof params.next === "string" ? params.next : null);
  const errorCode = typeof params.error === "string" ? params.error : null;
  const initialError = errorCode ? (CALLBACK_ERROR_MESSAGES[errorCode] ?? CALLBACK_ERROR_MESSAGES.auth_callback_failed) : null;

  return (
    <AuthCard
      badge="Secure Access"
      badgeTone="cyan"
      title="Login"
      description="Enter your account details to return to the telemetry console."
      footer={
        <>
          No account?{" "}
          <Link href="/register" className="font-semibold text-cyan-200 hover:text-cyan-100">
            Create one
          </Link>
        </>
      }
    >
      <GoogleSignInButton next={next} />
      <AuthDivider />
      <LoginForm next={next} initialError={initialError} />
    </AuthCard>
  );
}

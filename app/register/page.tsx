import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthDivider, GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard
      badge="New Pilot"
      badgeTone="green"
      title="Create account"
      description="Register to save latency history and compare route quality over time."
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-cyan-200 hover:text-cyan-100">
            Login
          </Link>
        </>
      }
    >
      <GoogleSignInButton />
      <AuthDivider />
      <RegisterForm />
    </AuthCard>
  );
}

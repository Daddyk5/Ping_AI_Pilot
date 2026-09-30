import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthDivider, GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Free. Save your tests and track your connection quality over time."
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-accent hover:text-accent-strong">
            Log in
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

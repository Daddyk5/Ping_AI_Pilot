import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we'll send you a link to choose a new password."
      footer={
        <Link href="/login" className="font-semibold text-accent hover:text-accent-strong">
          Back to log in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}

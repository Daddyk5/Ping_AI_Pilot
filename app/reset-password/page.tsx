import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { requirePageUser } from "@/lib/auth";

// Reached via the recovery email link, which signs the user in (see docs/AUTH.md),
// so a verified session is required to set the new password.
export default async function ResetPasswordPage() {
  const { user } = await requirePageUser("/reset-password");

  return (
    <AuthCard badge="Account Recovery" badgeTone="cyan" title="Choose a new password" description={`Signed in as ${user.email}.`}>
      <ResetPasswordForm />
    </AuthCard>
  );
}

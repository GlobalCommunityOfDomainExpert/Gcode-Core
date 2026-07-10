import { Suspense } from "react";
import { AuthCard } from "../_components/auth-card";
import { ResetPasswordForm } from "../_components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Reset Password"
      subtitle="Please choose a new, secure password."
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}

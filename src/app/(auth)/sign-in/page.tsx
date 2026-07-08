import { AuthCard } from "../_components/auth-card";
import { SignInForm } from "../_components/sign-in-form";

export default function SignInPage() {
  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to your GCODE account">
      <SignInForm />
    </AuthCard>
  );
}

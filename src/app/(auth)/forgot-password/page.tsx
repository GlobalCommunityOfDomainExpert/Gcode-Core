import NextLink from "next/link";
import { Button, Input } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { AuthCard } from "../_components/auth-card";

const linkClasses =
  "text-primary text-sm font-medium underline-offset-2 hover:underline";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a link to reset your password."
    >
      <form action="/reset-password" method="GET" className="flex flex-col gap-4">
        <FormField label="Email" htmlFor="email">
          <Input id="email" type="email" placeholder="you@example.com" />
        </FormField>

        <Button type="submit" variant="primary" className="w-full">
          Send Reset Link
        </Button>
      </form>

      <p className="text-body mt-6 text-center">
        <NextLink href="/sign-in" className={linkClasses}>
          ← Back to Sign In
        </NextLink>
      </p>
    </AuthCard>
  );
}

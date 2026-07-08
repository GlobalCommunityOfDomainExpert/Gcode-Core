import NextLink from "next/link";
import { Button, Divider, Input } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { AuthCard } from "../_components/auth-card";
import { GoogleButton } from "../_components/google-button";

const linkClasses =
  "text-primary text-sm font-medium underline-offset-2 hover:underline";

export default function SignInPage() {
  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to your GCODE account">
      <form className="flex flex-col gap-4">
        <FormField label="Email" htmlFor="email">
          <Input id="email" type="email" placeholder="you@example.com" />
        </FormField>
        <FormField label="Password" htmlFor="password">
          <Input id="password" type="password" placeholder="••••••••" />
        </FormField>

        <div className="text-right">
          <NextLink href="/forgot-password" className={linkClasses}>
            Forgot password?
          </NextLink>
        </div>

        <Button type="submit" variant="primary" className="w-full">
          Sign In
        </Button>

        <div className="flex items-center gap-3">
          <Divider />
          <span className="text-small text-text-secondary">or</span>
          <Divider />
        </div>

        <GoogleButton href="/sign-up?step=stakeholder" />
      </form>

      <p className="text-sm text-text-secondary mt-6 text-center">
        Don&apos;t have an account?{" "}
        <NextLink href="/sign-up" className={linkClasses}>
          Create one
        </NextLink>
      </p>
    </AuthCard>
  );
}

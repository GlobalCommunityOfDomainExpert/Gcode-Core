"use client";

import { FormEvent, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button, Divider, Input } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { GoogleButton } from "./google-button";
import { signIn } from "@/lib/api/auth";
import { setSession } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/client";

const linkClasses =
  "text-primary text-sm font-medium underline-offset-2 hover:underline";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    setSubmitting(true);
    setError(null);
    try {
      const { token, user_id, role_name } = await signIn(email, password);
      setSession(token, user_id, role_name);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not sign in",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </FormField>
        <FormField label="Password" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </FormField>

        <div className="text-right">
          <NextLink href="/forgot-password" className={linkClasses}>
            Forgot password?
          </NextLink>
        </div>

        {error && <p className="text-danger text-small">{error}</p>}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={submitting}
        >
          Sign In
        </Button>

        <div className="flex items-center gap-3">
          <Divider />
          <span className="text-small text-text-secondary">or</span>
          <Divider />
        </div>

        <GoogleButton />
      </form>

      <p className="text-sm text-text-secondary mt-6 text-center">
        Don&apos;t have an account?{" "}
        <NextLink href="/sign-up" className={linkClasses}>
          Create one
        </NextLink>
      </p>
    </>
  );
}

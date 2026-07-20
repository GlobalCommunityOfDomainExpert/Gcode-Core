"use client";

import { FormEvent, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/atoms";
import { Banner, FormField, Modal } from "@/components/molecules";
import { AuthCard } from "../_components/auth-card";
import { requestPasswordReset } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const linkClasses =
  "text-primary text-sm font-medium underline-offset-2 hover:underline";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not send reset link",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open onClose={() => router.back()} size="lg" bodyClassName="p-0">
      <AuthCard
        variant="modal"
        title="Forgot Password"
        subtitle="Enter your email and we'll send you a link to reset your password."
      >
        {sent ? (
          <Banner tone="success">
            If that email is registered, we&apos;ve sent a reset link to it.
          </Banner>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </FormField>

            {error && <p className="text-danger text-small">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={submitting}
            >
              Send Reset Link
            </Button>
          </form>
        )}

        <p className="text-body mt-6 text-center">
          <NextLink href="/sign-in" className={linkClasses}>
            ← Back to Sign In
          </NextLink>
        </p>
      </AuthCard>
    </Modal>
  );
}

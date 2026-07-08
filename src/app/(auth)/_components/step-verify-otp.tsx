"use client";

import { useState } from "react";
import { OtpInput } from "./otp-input";
import { verifyOtp } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export interface StepVerifyOtpProps {
  userId: number;
  testOtp: string;
  onVerified: () => void;
}

export function StepVerifyOtp({
  userId,
  testOtp,
  onVerified,
}: StepVerifyOtpProps) {
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleComplete(code: string) {
    setChecking(true);
    setError(null);
    try {
      await verifyOtp(userId, code, "REGISTRATION");
      onVerified();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not verify code",
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-text-secondary text-center">
        Enter the 6-digit code sent to your email
      </p>

      <p className="text-small text-text-secondary text-center">
        Dev OTP: <span className="font-semibold">{testOtp}</span>
      </p>

      <OtpInput
        error={!!error}
        disabled={checking}
        onComplete={handleComplete}
      />

      {error && (
        <p className="text-danger text-small text-center">{error}</p>
      )}
    </div>
  );
}

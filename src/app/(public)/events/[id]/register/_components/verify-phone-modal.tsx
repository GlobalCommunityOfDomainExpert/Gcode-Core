"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/atoms";
import { Modal } from "@/components/molecules";
import { OtpInput } from "@/app/(auth)/_components/otp-input";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const OTP_LENGTH = 6;

export interface VerifyPhoneModalProps {
  open: boolean;
  email: string;
  phone: string;
  onClose: () => void;
  onVerified: () => void;
}

// Sends the OTP itself on open, same pattern as VerifyEmailModal — the
// register page just needs to show this and get a verified/cancelled
// result back. Verifying phone (over WhatsApp) is what later lets
// ticket/submission notifications go to WhatsApp instead of email.
export function VerifyPhoneModal({
  open,
  email,
  phone,
  onClose,
  onVerified,
}: VerifyPhoneModalProps) {
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      setCode("");
      setError(null);
      setSending(true);
      try {
        await sendPhoneOtp(email, phone);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not send code");
      } finally {
        setSending(false);
      }
    })();
  }, [open, email, phone]);

  async function handleVerify() {
    setChecking(true);
    setError(null);
    try {
      await verifyPhoneOtp(email, code);
      onVerified();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not verify code");
    } finally {
      setChecking(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Verify Your Phone Number">
      <div className="flex flex-col gap-4">
        <p className="text-body text-text-secondary text-center">
          {sending
            ? `Sending a code to ${phone} on WhatsApp…`
            : `Enter the 6-digit code sent to ${phone} on WhatsApp`}
        </p>

        <OtpInput
          length={OTP_LENGTH}
          error={!!error}
          disabled={sending || checking}
          onChange={setCode}
        />

        {error && <p className="text-danger text-small text-center">{error}</p>}

        <Button
          type="button"
          variant="primary"
          className="w-full"
          loading={checking}
          disabled={sending || code.length !== OTP_LENGTH}
          onClick={handleVerify}
        >
          Verify & Continue
        </Button>
      </div>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "./auth-card";
import { AccountDetails, StepAccountDetails } from "./step-account-details";
import { StepVerifyOtp } from "./step-verify-otp";
import {
  StakeholderRole,
  StepSelectStakeholder,
} from "./step-select-stakeholder";
import { selectStakeholder, signIn, signUp } from "@/lib/api/auth";
import { setSession } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/client";

type Step = 0 | 1 | 2;

export function SignUpFlow() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState<Step>(0);
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [testOtp, setTestOtp] = useState("");
  const [role, setRole] = useState<StakeholderRole>("expert");
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  async function handleAccountSubmit(details: AccountDetails) {
    const { user_id, test_otp } = await signUp(
      details.email,
      details.fullName,
      details.password,
    );
    setAccount(details);
    setUserId(user_id);
    setTestOtp(test_otp);
    setStepIndex(1);
  }

  async function handleComplete() {
    if (userId === null || !account) return;
    setCompleting(true);
    setCompleteError(null);
    try {
      await selectStakeholder(userId, role);
      const { token, user_id, role_name } = await signIn(
        account.email,
        account.password,
      );
      setSession(token, user_id, role_name);
      router.push("/");
    } catch (err) {
      setCompleteError(
        err instanceof ApiError ? err.message : "Could not complete setup",
      );
    } finally {
      setCompleting(false);
    }
  }

  const titles: Record<Step, { title: string; subtitle: string }> = {
    0: { title: "Create Account", subtitle: "Join the GCODE ecosystem today" },
    1: {
      title: "Verify Your Email",
      subtitle: "Enter the code we sent you",
    },
    2: {
      title: "Who are you?",
      subtitle: "Tell us how you'll be using GCODE",
    },
  };

  return (
    <AuthCard {...titles[stepIndex]}>
      {stepIndex === 0 && <StepAccountDetails onSubmit={handleAccountSubmit} />}
      {stepIndex === 1 && userId !== null && (
        <StepVerifyOtp
          userId={userId}
          testOtp={testOtp}
          onVerified={() => setStepIndex(2)}
        />
      )}
      {stepIndex === 2 && (
        <StepSelectStakeholder
          value={role}
          onChange={setRole}
          onComplete={handleComplete}
          submitting={completing}
          error={completeError}
        />
      )}
    </AuthCard>
  );
}

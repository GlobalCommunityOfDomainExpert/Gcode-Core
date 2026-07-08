"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "./auth-card";
import { StepAccountDetails } from "./step-account-details";
import {
  StakeholderRole,
  StepSelectStakeholder,
} from "./step-select-stakeholder";

export function SignUpFlow() {
  const searchParams = useSearchParams();
  const [stepIndex, setStepIndex] = useState(() =>
    searchParams.get("step") === "stakeholder" ? 1 : 0,
  );
  const [role, setRole] = useState<StakeholderRole>("expert");

  return (
    <AuthCard
      title={stepIndex === 0 ? "Create Account" : "Who are you?"}
      subtitle={
        stepIndex === 0
          ? "Join the GCODE ecosystem today"
          : "Tell us how you'll be using GCODE"
      }
    >
      {stepIndex === 0 ? (
        <StepAccountDetails onContinueWithGoogle={() => setStepIndex(1)} />
      ) : (
        <StepSelectStakeholder value={role} onChange={setRole} />
      )}
    </AuthCard>
  );
}

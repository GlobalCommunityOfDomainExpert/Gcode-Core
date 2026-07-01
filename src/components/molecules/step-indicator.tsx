import { Check } from "lucide-react";
import { Divider, Icon } from "@/components/atoms";

export type StepStatus = "completed" | "current" | "upcoming";

export interface Step {
  label: string;
  status: StepStatus;
}

export interface StepIndicatorProps {
  steps: Step[];
}

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <ol className="flex items-start">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.label} className="flex flex-1 items-start last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-small font-semibold ${
                  step.status === "completed"
                    ? "bg-primary text-white"
                    : step.status === "current"
                      ? "border-2 border-primary text-primary"
                      : "border border-border-light text-text-secondary"
                }`}
              >
                {step.status === "completed" ? <Icon icon={Check} size="sm" /> : index + 1}
              </div>
              <span className="whitespace-nowrap text-small text-text-secondary">{step.label}</span>
            </div>
            {!isLast && (
              <div className="mx-2 flex h-8 flex-1 items-center">
                <Divider
                  className={step.status === "completed" ? "!border-primary" : ""}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

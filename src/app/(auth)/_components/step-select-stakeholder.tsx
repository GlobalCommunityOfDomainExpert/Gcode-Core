"use client";

import { Building2, GraduationCap, Rocket, User } from "lucide-react";
import { Button } from "@/components/atoms";
import { SelectableCard } from "@/components/molecules";

export type StakeholderRole = "expert" | "fresher" | "startup" | "institution";

const roleOptions: {
  role: StakeholderRole;
  title: string;
  subtitle: string;
  icon: typeof User;
}[] = [
  {
    role: "expert",
    title: "Domain Expert",
    subtitle: "Share expertise & mentor",
    icon: User,
  },
  {
    role: "fresher",
    title: "Fresher / Intern",
    subtitle: "Learn and grow",
    icon: GraduationCap,
  },
  {
    role: "startup",
    title: "Startup / MSME",
    subtitle: "Build and scale",
    icon: Rocket,
  },
  {
    role: "institution",
    title: "Institution",
    subtitle: "Partner with GCODE",
    icon: Building2,
  },
];

export interface StepSelectStakeholderProps {
  email?: string;
  value: StakeholderRole;
  onChange: (role: StakeholderRole) => void;
  onComplete: () => Promise<void>;
  submitting?: boolean;
  error?: string | null;
}

export function StepSelectStakeholder({
  value,
  onChange,
  onComplete,
  submitting = false,
  error,
}: StepSelectStakeholderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div
        role="radiogroup"
        aria-label="Choose your role"
        className="grid grid-cols-2 gap-4"
      >
        {roleOptions.map((option) => (
          <SelectableCard
            key={option.role}
            icon={option.icon}
            title={option.title}
            subtitle={option.subtitle}
            selected={value === option.role}
            onSelect={() => onChange(option.role)}
          />
        ))}
      </div>

      {error && <p className="text-danger text-small">{error}</p>}

      <Button
        variant="primary"
        className="w-full"
        loading={submitting}
        onClick={onComplete}
      >
        Complete Setup
      </Button>
    </div>
  );
}

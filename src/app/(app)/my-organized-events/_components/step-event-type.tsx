import {
  Building2,
  Coffee,
  Lightbulb,
  Mic,
  Presentation,
  Users,
} from "lucide-react";
import { SelectableCard } from "@/components/molecules";
import { EventType } from "@/lib/mock-events";

const eventTypeOptions: {
  type: EventType;
  icon: typeof Users;
  subtitle: string;
}[] = [
  { type: "Hackathon", icon: Users, subtitle: "Build sprint, team-based" },
  { type: "Expert AMA", icon: Mic, subtitle: "Live Q&A with an expert" },
  { type: "Webinar", icon: Presentation, subtitle: "Live or recorded session" },
  { type: "Ideathon", icon: Lightbulb, subtitle: "Idea pitching competition" },
  { type: "Community Meetup", icon: Coffee, subtitle: "Informal networking" },
  {
    type: "Institution Event",
    icon: Building2,
    subtitle: "Hosted with a partner institution",
  },
];

export interface StepEventTypeProps {
  value: EventType | null;
  onChange: (type: EventType) => void;
}

export function StepEventType({ value, onChange }: StepEventTypeProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-large text-text-primary font-semibold">
          What kind of event is this?
        </h2>
        <p className="text-body text-text-secondary">
          Pick the format that best matches your event.
        </p>
      </div>
      <div
        role="radiogroup"
        aria-label="Event type"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {eventTypeOptions.map((option) => (
          <SelectableCard
            key={option.type}
            icon={option.icon}
            title={option.type}
            subtitle={option.subtitle}
            selected={value === option.type}
            onSelect={() => onChange(option.type)}
          />
        ))}
      </div>
    </div>
  );
}

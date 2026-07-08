import {
  CalendarDays,
  Code2,
  HandHeart,
  Lightbulb,
  LucideIcon,
  Mic,
  PartyPopper,
  Presentation,
  Users,
} from "lucide-react";
import { SelectableCard } from "@/components/molecules";
import { useLookup } from "@/hooks/use-lookup";
import { getEventTypes } from "@/lib/api/lookups";
import { EventTypeLookup } from "@/lib/api/types";

// Keyed by type name (not id) so DB reordering / new rows stay correct.
const EVENT_TYPE_ICONS: Record<string, LucideIcon> = {
  Hackathon: Code2,
  "Expert AMA": Mic,
  Webinar: Presentation,
  Ideathon: Lightbulb,
  "Community Meetup": Users,
  Fest: PartyPopper,
  "Charity Event": HandHeart,
};

const DEFAULT_EVENT_TYPE_ICON = CalendarDays;

export interface StepEventTypeProps {
  value: EventTypeLookup["id"] | null;
  onChange: (id: EventTypeLookup["id"]) => void;
}

export function StepEventType({ value, onChange }: StepEventTypeProps) {
  const { status, data: eventTypes } = useLookup(getEventTypes);

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

      {status === "error" && (
        <p className="text-small text-danger">
          Couldn&apos;t load event types. Refresh to try again.
        </p>
      )}

      <div
        role="radiogroup"
        aria-label="Event type"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {status === "loading"
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="border-border-light bg-surface-light h-32 animate-pulse rounded-md border-2"
              />
            ))
          : eventTypes.map((eventType) => (
              <SelectableCard
                key={eventType.id}
                icon={
                  EVENT_TYPE_ICONS[eventType.name] ?? DEFAULT_EVENT_TYPE_ICON
                }
                title={eventType.name}
                subtitle={eventType.description ?? undefined}
                selected={value === eventType.id}
                onSelect={() => {
                  onChange(eventType.id);
                }}
              />
            ))}
      </div>
    </div>
  );
}

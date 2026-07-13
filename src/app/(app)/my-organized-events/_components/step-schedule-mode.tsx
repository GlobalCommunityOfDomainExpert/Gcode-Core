import { Input } from "@/components/atoms";
import { FormField, ToggleGroup } from "@/components/molecules";
import { useLookup } from "@/hooks/use-lookup";
import { getModes } from "@/lib/api/lookups";
import { EventModeLookup } from "@/lib/api/types";
import { UpdateEventDetailData, EventDetailData } from "@/lib/zod/event";

// Known DB mode_name codes get friendlier copy; anything else falls back to the raw name.
const KNOWN_MODE_LABEL: Record<string, string> = {
  ONLINE: "Online",
  PHYSICAL: "In-Person",
  HYBRID: "Hybrid",
};

export interface StepScheduleModeProps {
  data: EventDetailData;
  onChange: UpdateEventDetailData;
}

export function StepScheduleMode({ data, onChange }: StepScheduleModeProps) {
  const { status, data: modes } = useLookup(getModes);
  const activeMode = modes.find((mode) => mode.id === data.mode);
  const modeCode = activeMode?.mode_name ?? "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-large text-text-primary font-semibold">
          Schedule &amp; mode
        </h2>
        <p className="text-body text-text-secondary">
          When and how attendees will join.
        </p>
      </div>

      {status === "error" && (
        <p className="text-small text-danger">
          Couldn&apos;t load event modes. Refresh to try again.
        </p>
      )}

      <FormField label="Mode" htmlFor="event-mode">
        <ToggleGroup
          options={modes.map((mode: EventModeLookup) => ({
            value: String(mode.id),
            label: KNOWN_MODE_LABEL[mode.mode_name] ?? mode.mode_name,
          }))}
          value={String(data.mode)}
          onChange={(value) => onChange("mode", Number(value))}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Date"
          htmlFor="event-date"
          hint="Leave blank to show as Coming Soon — set it later once confirmed."
        >
          <Input
            id="event-date"
            type="date"
            value={data.date}
            onChange={(event) => onChange("date", event.target.value)}
          />
        </FormField>
        <FormField
          label="Time"
          htmlFor="event-time"
          hint="Leave blank to show as TBD."
        >
          <Input
            id="event-time"
            type="time"
            value={data.time}
            onChange={(event) => onChange("time", event.target.value)}
          />
        </FormField>
      </div>

      {(modeCode === "PHYSICAL" || modeCode === "HYBRID") && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="City" htmlFor="event-city">
            <Input
              id="event-city"
              value={data.city}
              onChange={(event) => onChange("city", event.target.value)}
              placeholder="e.g. Bangalore"
            />
          </FormField>
          <FormField label="Venue address" htmlFor="event-location">
            <Input
              id="event-location"
              value={data.location}
              onChange={(event) => onChange("location", event.target.value)}
              placeholder="e.g. GCODE Campus"
            />
          </FormField>
        </div>
      )}

      {(modeCode === "ONLINE" || modeCode === "HYBRID") && (
        <FormField
          label="Participation link"
          htmlFor="event-participation-link"
        >
          <Input
            id="event-participation-link"
            value={data.participationLink}
            onChange={(event) =>
              onChange("participationLink", event.target.value)
            }
            placeholder="Shared with registrants after they sign up"
          />
        </FormField>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Registration closes"
          htmlFor="event-registration-closes"
          hint="Optional — decide later. Defaults to the event date if left blank."
        >
          <Input
            id="event-registration-closes"
            type="date"
            value={data.registrationCloses}
            onChange={(event) =>
              onChange("registrationCloses", event.target.value)
            }
          />
        </FormField>
        <FormField
          label="Duration"
          htmlFor="event-duration"
          hint="Shown in place of Time on the event page when Time is left blank."
        >
          <Input
            id="event-duration"
            value={data.duration}
            onChange={(event) => onChange("duration", event.target.value)}
            placeholder="e.g. 3 hours"
          />
        </FormField>
      </div>
    </div>
  );
}

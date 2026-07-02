import { Input } from "@/components/atoms";
import { FormField, ToggleGroup } from "@/components/molecules";
import { UpdateWizardData, WizardData } from "./types";

const modeOptions = [
  { value: "Online", label: "Online" },
  { value: "In-Person", label: "In-Person" },
  { value: "Hybrid", label: "Hybrid" },
];

const locationLabel: Record<WizardData["mode"], string> = {
  Online: "Online meeting link",
  "In-Person": "Venue address",
  Hybrid: "Venue address & online link",
};

const locationPlaceholder: Record<WizardData["mode"], string> = {
  Online: "Shared with registrants after they sign up",
  "In-Person": "e.g. GCODE Campus, Bangalore",
  Hybrid: "e.g. GCODE Campus, Bangalore + streaming link",
};

export interface StepScheduleModeProps {
  data: WizardData;
  onChange: UpdateWizardData;
}

export function StepScheduleMode({ data, onChange }: StepScheduleModeProps) {
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

      <FormField label="Mode" htmlFor="event-mode">
        <ToggleGroup
          options={modeOptions}
          value={data.mode}
          onChange={(value) => onChange("mode", value as WizardData["mode"])}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Date" htmlFor="event-date" required>
          <Input
            id="event-date"
            type="date"
            value={data.date}
            onChange={(event) => onChange("date", event.target.value)}
          />
        </FormField>
        <FormField label="Time" htmlFor="event-time" required>
          <Input
            id="event-time"
            type="time"
            value={data.time}
            onChange={(event) => onChange("time", event.target.value)}
          />
        </FormField>
      </div>

      <FormField label={locationLabel[data.mode]} htmlFor="event-location">
        <Input
          id="event-location"
          value={data.location}
          onChange={(event) => onChange("location", event.target.value)}
          placeholder={locationPlaceholder[data.mode]}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Registration closes"
          htmlFor="event-registration-closes"
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
        <FormField label="Duration" htmlFor="event-duration">
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

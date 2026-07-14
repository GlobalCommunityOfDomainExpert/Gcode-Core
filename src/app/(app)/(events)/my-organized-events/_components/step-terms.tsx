import { Textarea } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { UpdateEventDetailData, EventDetailData } from "@/lib/zod/event";
import { DEFAULT_ELIGIBILITY, DEFAULT_TERMS } from "@/lib/api/adapters";

export interface StepTermsProps {
  data: EventDetailData;
  onChange: UpdateEventDetailData;
}

export function StepTerms({ data, onChange }: StepTermsProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-large text-text-primary font-semibold">
          Terms &amp; Eligibility
        </h2>
        <p className="text-body text-text-secondary">
          Shown on the event&apos;s public page. Leave either blank to use
          GCODE&apos;s default text instead.
        </p>
      </div>

      <FormField
        label="Eligibility"
        htmlFor="event-eligibility"
        hint="One point per line. Leave blank to show default eligibility text."
      >
        <div className="space-y-1">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                onChange("eligibility", DEFAULT_ELIGIBILITY.join("\n"))
              }
              className="text-small text-primary hover:underline"
            >
              Use default template
            </button>
          </div>
          <Textarea
            id="event-eligibility"
            value={data.eligibility}
            onChange={(event) => onChange("eligibility", event.target.value)}
            placeholder="Open to all professionals and students...
Participants must be 18 years or older..."
            rows={6}
          />
        </div>
      </FormField>

      <FormField
        label="Terms & Conditions"
        htmlFor="event-terms"
        hint="One point per line. Leave blank to show default terms."
      >
        <div className="space-y-1">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onChange("terms", DEFAULT_TERMS.join("\n"))}
              className="text-small text-primary hover:underline"
            >
              Use default template
            </button>
          </div>
          <Textarea
            id="event-terms"
            value={data.terms}
            onChange={(event) => onChange("terms", event.target.value)}
            placeholder="No refunds unless cancelled by organizer...
Registration confirms agreement to code of conduct..."
            rows={6}
          />
        </div>
      </FormField>
    </div>
  );
}

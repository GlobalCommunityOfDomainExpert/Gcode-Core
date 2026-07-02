import { Input, Switch, Textarea } from "@/components/atoms";
import { FormField, ToggleGroup } from "@/components/molecules";
import { UpdateWizardData, WizardData } from "./types";

const priceOptions = [
  { value: "Free", label: "Free" },
  { value: "Paid", label: "Paid" },
];

export interface StepDetailsProps {
  data: WizardData;
  onChange: UpdateWizardData;
}

export function StepDetails({ data, onChange }: StepDetailsProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-large text-text-primary font-semibold">
          Tell us about the event
        </h2>
        <p className="text-body text-text-secondary">
          This shows up on the event&apos;s public page.
        </p>
      </div>

      <FormField label="Event Title" htmlFor="event-title" required>
        <Input
          id="event-title"
          value={data.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="e.g. GCODE Build Sprint · Winter 2026"
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="event-description"
        required
        hint="One idea per line — each becomes a paragraph on the event page."
      >
        <Textarea
          id="event-description"
          value={data.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="Describe the event, who it's for, and what attendees will get out of it..."
          rows={4}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Price" htmlFor="event-price">
          <ToggleGroup
            options={priceOptions}
            value={data.price}
            onChange={(value) =>
              onChange("price", value as WizardData["price"])
            }
          />
        </FormField>
        {data.price === "Paid" && (
          <FormField label="Amount (₹)" htmlFor="event-price-amount">
            <Input
              id="event-price-amount"
              type="number"
              min={0}
              value={data.priceAmount}
              onChange={(event) => onChange("priceAmount", event.target.value)}
              placeholder="299"
            />
          </FormField>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Capacity"
          htmlFor="event-capacity"
          hint="Leave blank for unlimited."
        >
          <Input
            id="event-capacity"
            type="number"
            min={0}
            value={data.capacity}
            onChange={(event) => onChange("capacity", event.target.value)}
            placeholder="200"
          />
        </FormField>
        <FormField label="Certificate" htmlFor="event-certificate">
          <div className="flex h-11 items-center">
            <Switch
              id="event-certificate"
              checked={data.certificate}
              onChange={(event) =>
                onChange("certificate", event.target.checked)
              }
              label="Issue a certificate on completion"
            />
          </div>
        </FormField>
      </div>
    </div>
  );
}

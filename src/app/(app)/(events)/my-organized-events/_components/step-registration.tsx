"use client";

import { useState } from "react";
import { Input, SectionLabel, Switch } from "@/components/atoms";
import { FormField, ToggleGroup } from "@/components/molecules";
import { EventDetailData, UpdateEventDetailData } from "@/lib/zod/event";

const priceOptions = [
  { value: "Free", label: "Free" },
  { value: "Paid", label: "Paid" },
];

export interface StepRegistrationProps {
  data: EventDetailData;
  onChange: UpdateEventDetailData;
}

export function StepRegistration({ data, onChange }: StepRegistrationProps) {
  // Paid/Free tracked locally so clearing the amount field to retype it
  // doesn't snap the toggle back to Free — same pattern as step-details.
  const [attendeeIsPaid, setAttendeeIsPaid] = useState(data.priceAmount > 0);
  const [participantIsPaid, setParticipantIsPaid] = useState(
    data.participantPriceAmount > 0,
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-large text-text-primary font-semibold">
          Registration &amp; passes
        </h2>
        <p className="text-body text-text-secondary">
          Set up how people register. Add an Attendee pass and/or a Participant
          pass for people who perform an activity (e.g. hackathon builders) —
          each independently enabled, with its own price and capacity. Both can
          be opened or closed again any time from the event&apos;s Overview
          page, even after the registration deadline passes.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <SectionLabel>Attendee pass</SectionLabel>
          <Switch
            label="Enable"
            checked={data.attendeeRegistrationEnabled}
            onChange={(event) =>
              onChange("attendeeRegistrationEnabled", event.target.checked)
            }
          />
        </div>
        {!data.attendeeRegistrationEnabled && (
          <p className="text-small text-text-secondary">
            Off — this pass won&apos;t be offered on the register page.
          </p>
        )}
        {data.attendeeRegistrationEnabled && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Label" htmlFor="attendee-label">
                <Input
                  id="attendee-label"
                  value={data.attendeeLabel}
                  onChange={(event) =>
                    onChange("attendeeLabel", event.target.value)
                  }
                  placeholder="Attendee"
                />
              </FormField>
              <FormField label="Description" htmlFor="attendee-description">
                <Input
                  id="attendee-description"
                  value={data.attendeeDescription}
                  onChange={(event) =>
                    onChange("attendeeDescription", event.target.value)
                  }
                  placeholder="Watch the sessions and network."
                />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Price" htmlFor="attendee-price">
                <ToggleGroup
                  options={priceOptions}
                  value={attendeeIsPaid ? "Paid" : "Free"}
                  onChange={(value) => {
                    const paid = value === "Paid";
                    setAttendeeIsPaid(paid);
                    if (!paid) onChange("priceAmount", 0);
                  }}
                />
              </FormField>
              {attendeeIsPaid && (
                <FormField label="Amount (₹)" htmlFor="attendee-price-amount">
                  <Input
                    id="attendee-price-amount"
                    type="number"
                    min={0}
                    value={data.priceAmount || ""}
                    onChange={(event) =>
                      onChange("priceAmount", Number(event.target.value) || 0)
                    }
                    placeholder="299"
                  />
                </FormField>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Capacity"
                htmlFor="attendee-capacity"
                hint="Leave blank for unlimited."
              >
                <Input
                  id="attendee-capacity"
                  type="number"
                  min={0}
                  value={data.capacity || ""}
                  onChange={(event) =>
                    onChange("capacity", Number(event.target.value) || 0)
                  }
                  placeholder="200"
                />
              </FormField>
              <FormField
                label="Max Tickets Per Booking"
                htmlFor="attendee-max-tickets"
                hint="Leave blank for no per-booking limit."
              >
                <Input
                  id="attendee-max-tickets"
                  type="number"
                  min={0}
                  value={data.attendeeMaxTicketsPerRegistration || ""}
                  onChange={(event) =>
                    onChange(
                      "attendeeMaxTicketsPerRegistration",
                      Number(event.target.value) || 0,
                    )
                  }
                  placeholder="4"
                />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Registration Opens"
                htmlFor="attendee-registration-opens"
                hint="Leave blank to open immediately."
              >
                <Input
                  id="attendee-registration-opens"
                  type="date"
                  value={data.attendeeRegistrationOpens}
                  onChange={(event) =>
                    onChange("attendeeRegistrationOpens", event.target.value)
                  }
                />
              </FormField>
              <FormField
                label="Registration Closes"
                htmlFor="attendee-registration-closes"
                hint="Optional — decide later. Defaults to the event date if left blank."
              >
                <Input
                  id="attendee-registration-closes"
                  type="date"
                  value={data.attendeeRegistrationCloses}
                  onChange={(event) =>
                    onChange("attendeeRegistrationCloses", event.target.value)
                  }
                />
              </FormField>
            </div>
          </>
        )}
      </div>

      <div className="border-border-light space-y-4 border-t pt-6">
        <div className="flex items-center justify-between gap-2">
          <SectionLabel>Participant pass</SectionLabel>
          <Switch
            label="Enable"
            checked={data.participantRegistrationEnabled}
            onChange={(event) =>
              onChange("participantRegistrationEnabled", event.target.checked)
            }
          />
        </div>
        {!data.participantRegistrationEnabled && (
          <p className="text-small text-text-secondary">
            Off — this event only offers the Attendee pass above.
          </p>
        )}
        {data.participantRegistrationEnabled && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Label" htmlFor="participant-label">
                <Input
                  id="participant-label"
                  value={data.participantLabel}
                  onChange={(event) =>
                    onChange("participantLabel", event.target.value)
                  }
                  placeholder="Hacker Pass"
                />
              </FormField>
              <FormField label="Description" htmlFor="participant-description">
                <Input
                  id="participant-description"
                  value={data.participantDescription}
                  onChange={(event) =>
                    onChange("participantDescription", event.target.value)
                  }
                  placeholder="Join a team and submit a project."
                />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Price" htmlFor="participant-price">
                <ToggleGroup
                  options={priceOptions}
                  value={participantIsPaid ? "Paid" : "Free"}
                  onChange={(value) => {
                    const paid = value === "Paid";
                    setParticipantIsPaid(paid);
                    if (!paid) onChange("participantPriceAmount", 0);
                  }}
                />
              </FormField>
              {participantIsPaid && (
                <FormField
                  label="Amount (₹)"
                  htmlFor="participant-price-amount"
                >
                  <Input
                    id="participant-price-amount"
                    type="number"
                    min={0}
                    value={data.participantPriceAmount || ""}
                    onChange={(event) =>
                      onChange(
                        "participantPriceAmount",
                        Number(event.target.value) || 0,
                      )
                    }
                    placeholder="0"
                  />
                </FormField>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Capacity"
                htmlFor="participant-capacity"
                hint="Leave blank for unlimited."
              >
                <Input
                  id="participant-capacity"
                  type="number"
                  min={0}
                  value={data.participantCapacity || ""}
                  onChange={(event) =>
                    onChange(
                      "participantCapacity",
                      Number(event.target.value) || 0,
                    )
                  }
                  placeholder="50"
                />
              </FormField>
              <FormField
                label="Max Tickets Per Booking"
                htmlFor="participant-max-tickets"
                hint="Leave blank for no per-booking limit."
              >
                <Input
                  id="participant-max-tickets"
                  type="number"
                  min={0}
                  value={data.participantMaxTicketsPerRegistration || ""}
                  onChange={(event) =>
                    onChange(
                      "participantMaxTicketsPerRegistration",
                      Number(event.target.value) || 0,
                    )
                  }
                  placeholder="4"
                />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Registration Opens"
                htmlFor="participant-registration-opens"
                hint="Leave blank to open immediately."
              >
                <Input
                  id="participant-registration-opens"
                  type="date"
                  value={data.participantRegistrationOpens}
                  onChange={(event) =>
                    onChange("participantRegistrationOpens", event.target.value)
                  }
                />
              </FormField>
              <FormField
                label="Registration Closes"
                htmlFor="participant-registration-closes"
                hint="Optional — decide later. Defaults to the event date if left blank."
              >
                <Input
                  id="participant-registration-closes"
                  type="date"
                  value={data.participantRegistrationCloses}
                  onChange={(event) =>
                    onChange(
                      "participantRegistrationCloses",
                      event.target.value,
                    )
                  }
                />
              </FormField>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

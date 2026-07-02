"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { Step, StepIndicator } from "@/components/molecules";
import { AuthenticatedShell } from "@/app/_components/authenticated-shell";
import { MockEvent } from "@/lib/mock-events";
import {
  addOrganizedEvent,
  saveEventDraft,
  slugifyTitle,
  updateOrganizedEvent,
} from "@/lib/organized-events";
import { addCommunityRequest } from "@/lib/community-requests";
import { StepEventType } from "./step-event-type";
import { StepDetails } from "./step-details";
import { StepScheduleMode } from "./step-schedule-mode";
import { StepCommunityRequest } from "./step-community-request";
import { StepReview } from "./step-review";
import { initialWizardData, SelectedStakeholder, WizardData } from "./types";

const createStepLabels = [
  "Type",
  "Details",
  "Schedule & Mode",
  "Community",
  "Review",
];
const editStepLabels = ["Type", "Details", "Schedule & Mode", "Review"];

export interface EventWizardProps {
  mode: "create" | "edit";
  eventId?: string;
  initialData?: WizardData;
}

export function EventWizard({ mode, eventId, initialData }: EventWizardProps) {
  const router = useRouter();
  const stepLabels = mode === "edit" ? editStepLabels : createStepLabels;
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<WizardData>(
    initialData ?? initialWizardData,
  );
  const [selectedStakeholders, setSelectedStakeholders] = useState<
    SelectedStakeholder[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  const steps: Step[] = stepLabels.map((label, index) => ({
    label,
    status:
      index < stepIndex
        ? "completed"
        : index === stepIndex
          ? "current"
          : "upcoming",
  }));

  function goNext() {
    setStepIndex((index) => Math.min(index + 1, stepLabels.length - 1));
  }

  function goBack() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function skipCommunityStep() {
    setSelectedStakeholders([]);
    goNext();
  }

  function canProceed(): boolean {
    if (stepIndex === 0) return data.type !== null;
    if (stepIndex === 1)
      return data.title.trim() !== "" && data.description.trim() !== "";
    if (stepIndex === 2) return data.date !== "" && data.time !== "";
    return true;
  }

  function deriveEventFields(): {
    price: string;
    formattedDate: string;
    formattedTime: string;
    capacity: number | undefined;
    location: string;
  } {
    const formattedDate = data.date
      ? new Date(data.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";
    const formattedTime = data.time ? `${data.time} IST` : "";
    const price =
      data.price === "Free" ? "Free" : `₹${data.priceAmount || "0"}`;
    const capacity = data.capacity ? Number(data.capacity) : undefined;
    const location =
      data.location ||
      (data.mode === "Online"
        ? "Online · Link shared after registration"
        : "Venue details shared after registration");
    return { price, formattedDate, formattedTime, capacity, location };
  }

  function handleCreate() {
    if (!data.type) return;
    setSubmitting(true);

    const { price, formattedDate, formattedTime, capacity, location } =
      deriveEventFields();
    const id = slugifyTitle(data.title);

    const event: MockEvent = {
      id,
      title: data.title,
      type: data.type,
      mode: data.mode,
      status: "published",
      price,
      date: formattedDate,
      time: formattedTime,
      location,
      registeredCount: 0,
      capacity,
      spotsLeft: capacity,
      featured: false,
      registrationCloses: data.registrationCloses || formattedDate,
      duration: data.duration || "TBD",
      teamSize: "Individual attendance",
      certificate: data.certificate,
      description: data.description.split("\n").filter(Boolean),
      agenda: [
        {
          time: formattedTime || "TBD",
          title: "Kickoff",
          description: "Event begins",
        },
      ],
      organizer: {
        name: "Arjun Sharma",
        title: "Expert",
        verified: true,
        eventsHosted: 1,
        attendees: 0,
      },
      terms: [
        "Hosted via GCODE.",
        price === "Free"
          ? "Free event — no registration fee."
          : `Paid event — ${price} per seat.`,
        "GCODE reserves the right to update event details before the start date.",
      ],
    };

    addOrganizedEvent(event);
    saveEventDraft(id, data);

    selectedStakeholders.forEach((selected) => {
      addCommunityRequest({
        eventId: id,
        stakeholderId: selected.stakeholderId,
        category: selected.category,
        message: selected.message,
      });
    });

    router.push(`/my-organized-events/${id}`);
  }

  function handleUpdate() {
    if (!data.type || !eventId) return;
    setSubmitting(true);

    const { price, formattedDate, formattedTime, capacity, location } =
      deriveEventFields();

    updateOrganizedEvent(eventId, {
      title: data.title,
      type: data.type,
      mode: data.mode,
      price,
      date: formattedDate,
      time: formattedTime,
      location,
      capacity,
      spotsLeft: capacity,
      registrationCloses: data.registrationCloses || formattedDate,
      duration: data.duration || "TBD",
      certificate: data.certificate,
      description: data.description.split("\n").filter(Boolean),
      agenda: [
        {
          time: formattedTime || "TBD",
          title: "Kickoff",
          description: "Event begins",
        },
      ],
      terms: [
        "Hosted via GCODE.",
        price === "Free"
          ? "Free event — no registration fee."
          : `Paid event — ${price} per seat.`,
        "GCODE reserves the right to update event details before the start date.",
      ],
    });
    saveEventDraft(eventId, data);

    router.push(`/my-organized-events/${eventId}`);
  }

  const isLastStep = stepIndex === stepLabels.length - 1;
  const isCommunityStep = mode === "create" && stepIndex === 3;

  return (
    <AuthenticatedShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-display text-text-primary font-extrabold">
            {mode === "create" ? "Host an Event" : "Edit Event"}
          </h1>
          <p className="text-body text-text-secondary">
            {mode === "create"
              ? "Set up your event and optionally request help from the community."
              : "Update your event details. Community requests are managed separately from the event's Community tab."}
          </p>
        </div>

        <div className="border-border-light bg-surface-light rounded-md border p-4">
          <StepIndicator steps={steps} />
        </div>

        <div className="border-border-light bg-surface-light rounded-md border p-6">
          {stepIndex === 0 && (
            <StepEventType
              value={data.type}
              onChange={(type) => update("type", type)}
            />
          )}
          {stepIndex === 1 && <StepDetails data={data} onChange={update} />}
          {stepIndex === 2 && (
            <StepScheduleMode data={data} onChange={update} />
          )}
          {isCommunityStep && (
            <StepCommunityRequest
              selected={selectedStakeholders}
              onChange={setSelectedStakeholders}
            />
          )}
          {isLastStep && (
            <StepReview
              data={data}
              selectedStakeholders={selectedStakeholders}
              showCommunityRequests={mode === "create"}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={goBack}
            disabled={stepIndex === 0 || submitting}
          >
            ← Back
          </Button>
          <div className="flex items-center gap-3">
            {isCommunityStep && (
              <Button variant="ghost" onClick={skipCommunityStep}>
                Skip this step
              </Button>
            )}
            {!isLastStep ? (
              <Button
                variant="primary"
                onClick={goNext}
                disabled={!canProceed()}
              >
                Next →
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={mode === "create" ? handleCreate : handleUpdate}
                loading={submitting}
              >
                {mode === "create" ? "Publish Event" : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  );
}

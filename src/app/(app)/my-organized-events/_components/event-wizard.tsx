"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { Step, StepIndicator } from "@/components/molecules";
import { MockEvent } from "@/lib/mock-events";
import { useCommunityRequestsStore } from "@/store/community-requests-store";
import { useEventWizardStore } from "@/store/event-wizard-store";
import {
  slugifyTitle,
  useOrganizedEventsStore,
} from "@/store/organized-events-store";
import { StepEventType } from "./step-event-type";
import { StepDetails } from "./step-details";
import { StepScheduleMode } from "./step-schedule-mode";
import { StepAgendaLinks } from "./step-agenda-links";
import { StepCommunityRequest } from "./step-community-request";
import { StepReview } from "./step-review";
import { WizardData } from "./types";

const createStepLabels = [
  "Type",
  "Details",
  "Schedule & Mode",
  "Agenda & Media",
  "Community",
  "Review",
];
const editStepLabels = [
  "Type",
  "Details",
  "Schedule & Mode",
  "Agenda & Media",
  "Review",
];

export interface EventWizardProps {
  mode: "create" | "edit";
  eventId?: string;
  initialData?: WizardData;
}

export function EventWizard({ mode, eventId, initialData }: EventWizardProps) {
  const router = useRouter();
  const stepLabels = mode === "edit" ? editStepLabels : createStepLabels;

  const stepIndex = useEventWizardStore((state) => state.stepIndex);
  const data = useEventWizardStore((state) => state.data);
  const selectedStakeholders = useEventWizardStore(
    (state) => state.selectedStakeholders,
  );
  const submitting = useEventWizardStore((state) => state.submitting);
  const setStepIndex = useEventWizardStore((state) => state.setStep);
  const update = useEventWizardStore((state) => state.update);
  const setSelectedStakeholders = useEventWizardStore(
    (state) => state.setSelectedStakeholders,
  );
  const setSubmitting = useEventWizardStore((state) => state.setSubmitting);
  const resetWizard = useEventWizardStore((state) => state.reset);

  const addEvent = useOrganizedEventsStore((state) => state.addEvent);
  const updateEvent = useOrganizedEventsStore((state) => state.updateEvent);
  const saveDraft = useOrganizedEventsStore((state) => state.saveDraft);
  const addRequest = useCommunityRequestsStore((state) => state.addRequest);

  useEffect(() => {
    resetWizard(mode === "edit" ? initialData : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, eventId]);

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
    setStepIndex(Math.min(stepIndex + 1, stepLabels.length - 1));
  }

  function goBack() {
    setStepIndex(Math.max(stepIndex - 1, 0));
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
      agenda: data.agenda,
      socialLinks: data.socialLinks,
      coverImageUrl: data.coverImageUrl || undefined,
      mediaUrls: data.mediaUrls,
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

    addEvent(event);
    saveDraft(id, data);

    selectedStakeholders.forEach((selected) => {
      addRequest({
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

    updateEvent(eventId, {
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
      agenda: data.agenda,
      socialLinks: data.socialLinks,
      coverImageUrl: data.coverImageUrl || undefined,
      mediaUrls: data.mediaUrls,
      terms: [
        "Hosted via GCODE.",
        price === "Free"
          ? "Free event — no registration fee."
          : `Paid event — ${price} per seat.`,
        "GCODE reserves the right to update event details before the start date.",
      ],
    });
    saveDraft(eventId, data);

    router.push(`/my-organized-events/${eventId}`);
  }

  const isLastStep = stepIndex === stepLabels.length - 1;
  const isCommunityStep = mode === "create" && stepIndex === 4;

  return (
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
        {stepIndex === 2 && <StepScheduleMode data={data} onChange={update} />}
        {stepIndex === 3 && <StepAgendaLinks data={data} onChange={update} />}
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
            <Button variant="primary" onClick={goNext} disabled={!canProceed()}>
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
  );
}

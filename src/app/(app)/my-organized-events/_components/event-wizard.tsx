"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/atoms";
import { Step, StepIndicator } from "@/components/molecules";
import { useWizardStore } from "@/lib/store/wizard-store";

import { StepEventType } from "./step-event-type";
import { StepDetails } from "./step-details";
import { StepScheduleMode } from "@/app/(app)/my-organized-events/_components/step-schedule-mode";
import { StepTimelineLinks } from "./step-timeline-links";
import { StepTerms } from "./step-terms";
import { StepCommunityRequest } from "./step-community-request";
import { StepReview } from "@/app/(app)/my-organized-events/_components/step-review";
import { EventDetailData } from "@/lib/zod/event";
import {
  createEvent,
  updateEvent,
  replaceEventSocialLinks,
  replaceEventMedia,
  replaceEventTimeline,
  uploadCoverImage,
  assignCategory,
  removeCategory,
} from "@/lib/api/events";
import { toCreatePayload, toTimelinePayload } from "@/lib/api/adapters";
import { createCommunityRequests } from "@/lib/api/community";

const createStepLabels = [
  "Type",
  "Details",
  "Schedule & Mode",
  "Timeline & Media",
  "Terms",
  "Community",
  "Review",
];
const editStepLabels = [
  "Type",
  "Details",
  "Schedule & Mode",
  "Timeline & Media",
  "Terms",
  "Review",
];

export interface EventWizardProps {
  mode: "create" | "edit";
  eventId?: string;
  initialData?: EventDetailData;
}

export function EventWizard({ mode, eventId, initialData }: EventWizardProps) {
  const router = useRouter();
  const stepLabels = mode === "edit" ? editStepLabels : createStepLabels;

  const stepIndex = useWizardStore((state) => state.stepIndex);
  const data = useWizardStore((state) => state.data);
  const selectedStakeholders = useWizardStore(
    (state) => state.selectedStakeholders,
  );
  const submitting = useWizardStore((state) => state.submitting);
  const setStepIndex = useWizardStore((state) => state.setStep);
  const update = useWizardStore((state) => state.update);
  const setSelectedStakeholders = useWizardStore(
    (state) => state.setSelectedStakeholders,
  );
  const setSubmitting = useWizardStore((state) => state.setSubmitting);
  const resetWizard = useWizardStore((state) => state.reset);

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

  async function persistCategories(id: number | string, originalIds: number[]) {
    const original = new Set(originalIds);
    const current = new Set(data.categoryIds);
    const toAdd = data.categoryIds.filter((c) => !original.has(c));
    const toRemove = originalIds.filter((c) => !current.has(c));
    await Promise.all([
      ...toAdd.map((categoryId) => assignCategory(id, categoryId)),
      ...toRemove.map((categoryId) => removeCategory(id, categoryId)),
    ]);
  }

  async function persistChildCollections(id: number | string) {
    const links = data.socialLinks.filter((l) => l.url.trim() !== "");
    if (links.length > 0) await replaceEventSocialLinks(id, links);

    const media = data.mediaUrls
      .filter((url) => url.trim() !== "")
      .map((url, index) => ({ url, sortOrder: index }));
    if (media.length > 0) await replaceEventMedia(id, media);

    const timeline = toTimelinePayload(data);
    if (timeline.length > 0) await replaceEventTimeline(id, timeline);

    // Cover image: recover the bytes from the blob: preview URL and upload.
    if (data.coverImageUrl.startsWith("blob:")) {
      const blob = await fetch(data.coverImageUrl).then((r) => r.blob());
      await uploadCoverImage(id, blob);
    }
  }

  async function handleCreate() {
    if (!data.type) return;
    setSubmitting(true);
    try {
      const { id } = await createEvent(toCreatePayload(data));
      await persistChildCollections(id);
      await persistCategories(id, []);
      if (selectedStakeholders.length > 0) {
        await createCommunityRequests(
          id,
          selectedStakeholders.map((s) => ({
            stakeholderId: s.stakeholderId,
            category: s.category,
            message: s.message,
          })),
        );
      }
      // TODO: upload cover image (blob -> hosted URL) then set-cover-image
      router.push(`/my-organized-events/${id}`);
    } catch (error) {
      console.error("Failed to create event", error);
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (!data.type || !eventId) return;
    setSubmitting(true);
    try {
      await updateEvent(eventId, toCreatePayload(data));
      await persistChildCollections(eventId);
      await persistCategories(eventId, initialData?.categoryIds ?? []);
      router.push(`/my-organized-events/${eventId}`);
    } catch (error) {
      console.error("Failed to update event", error);
      setSubmitting(false);
    }
  }

  const isLastStep = stepIndex === stepLabels.length - 1;
  const isCommunityStep = mode === "create" && stepIndex === 5;

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

      <Card>
        <StepIndicator steps={steps} />
      </Card>

      <Card padding="md">
        {stepIndex === 0 && (
          <StepEventType
            value={data.type}
            onChange={(type) => update("type", type)}
          />
        )}
        {stepIndex === 1 && <StepDetails data={data} onChange={update} />}
        {stepIndex === 2 && <StepScheduleMode data={data} onChange={update} />}
        {stepIndex === 3 && <StepTimelineLinks data={data} onChange={update} />}
        {stepIndex === 4 && <StepTerms data={data} onChange={update} />}
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
      </Card>

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

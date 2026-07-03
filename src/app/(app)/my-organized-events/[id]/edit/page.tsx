"use client";

import { useParams } from "next/navigation";
import { PencilOff } from "lucide-react";
import { ButtonLink } from "@/components/atoms";
import { EmptyState } from "@/components/molecules";
import { useOrganizedEventsStore } from "@/store/organized-events-store";
import { EventWizard } from "../../_components/event-wizard";
import { WizardData } from "../../_components/types";

export default function EditOrganizedEventPage() {
  const params = useParams<{ id: string }>();
  const event = useOrganizedEventsStore((state) =>
    state.events.find((item) => item.id === params.id),
  );
  const getDraft = useOrganizedEventsStore((state) => state.getDraft);
  const draft = event ? getDraft<WizardData>(event.id) : undefined;

  if (!event || !draft) {
    return (
      <div className="mx-auto max-w-md">
        <EmptyState
          icon={PencilOff}
          title="Can't edit this event"
          description="Only events you hosted through GCODE can be edited, and the original form data must still be in memory (it resets on a full page refresh)."
          action={
            <ButtonLink href="/my-organized-events" variant="primary">
              Back to Organizing
            </ButtonLink>
          }
        />
      </div>
    );
  }

  return <EventWizard mode="edit" eventId={event.id} initialData={draft} />;
}

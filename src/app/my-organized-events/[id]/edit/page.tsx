"use client";

import { useParams } from "next/navigation";
import { PencilOff } from "lucide-react";
import { ButtonLink } from "@/components/atoms";
import { EmptyState } from "@/components/molecules";
import { AuthenticatedShell } from "@/app/_components/authenticated-shell";
import { getOrganizedEventById, getEventDraft } from "@/lib/organized-events";
import { EventWizard } from "../../_components/event-wizard";
import { WizardData } from "../../_components/types";

export default function EditOrganizedEventPage() {
  const params = useParams<{ id: string }>();
  const event = getOrganizedEventById(params.id);
  const draft = event ? getEventDraft<WizardData>(event.id) : undefined;

  if (!event || !draft) {
    return (
      <AuthenticatedShell>
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
      </AuthenticatedShell>
    );
  }

  return <EventWizard mode="edit" eventId={event.id} initialData={draft} />;
}

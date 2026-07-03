"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Clock, Mic } from "lucide-react";
import { Avatar, Badge, ButtonLink, Icon } from "@/components/atoms";
import { Breadcrumb, EmptyState } from "@/components/molecules";
import {
  getStakeholderById,
  stakeholderCategoryLabel,
  StakeholderCategory,
} from "@/lib/community-requests";
import { getCommunityRequestById } from "@/store/community-requests-store";
import { useAnyEventById } from "@/store/organized-events-store";
import { ResponseForm } from "../_components/response-form";

const categoryIntro: Record<StakeholderCategory, string> = {
  "Venue Partner": "Provide or coordinate a venue for the event.",
  "Sponsorship Partner":
    "Provide sponsorship support — funding, credits, or prizes — for the event.",
  "Guest Speaker": "Attend the event and present or speak on a relevant topic.",
  Volunteer: "Help with on-ground or remote event logistics.",
};

export default function CommunityRequestPage() {
  const params = useParams<{ id: string; requestId: string }>();
  const event = useAnyEventById(params.id);
  const request = getCommunityRequestById(params.requestId);
  const stakeholder = request
    ? getStakeholderById(request.stakeholderId)
    : undefined;

  if (!event || !request || !stakeholder) {
    return (
      <div className="mx-auto max-w-md">
        <EmptyState
          title="Request not found"
          description="This request may not exist, or in-memory data was reset by a full page refresh."
          action={
            <ButtonLink href="/events" variant="primary">
              Browse Events
            </ButtonLink>
          }
        />
      </div>
    );
  }

  return (
    <CommunityRequestView
      event={event}
      request={request}
      stakeholder={stakeholder}
    />
  );
}

function CommunityRequestView({
  event,
  request,
  stakeholder,
}: {
  event: NonNullable<ReturnType<typeof useAnyEventById>>;
  request: NonNullable<ReturnType<typeof getCommunityRequestById>>;
  stakeholder: NonNullable<ReturnType<typeof getStakeholderById>>;
}) {
  const [status, setStatus] = useState(request.status);
  const [respondedAt, setRespondedAt] = useState(request.respondedAt);
  const categoryLabel = stakeholderCategoryLabel[request.category];

  function handleRespond(nextStatus: typeof status, nextRespondedAt: string) {
    setStatus(nextStatus);
    setRespondedAt(nextRespondedAt);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Breadcrumb
        items={[{ label: "Community Request" }, { label: categoryLabel }]}
      />

      <div className="bg-primary space-y-3 rounded-md p-6">
        <Badge variant="solid" tone="neutral">
          {categoryLabel}
        </Badge>
        <div className="flex items-start gap-3">
          <Icon icon={Mic} size="lg" className="mt-1 text-white" />
          <div>
            <h1 className="text-large font-bold text-white">
              You&apos;ve been invited to help with an event
            </h1>
            <p className="text-body text-white/70">
              An organizer in the GCODE community needs your help,{" "}
              {stakeholder.name}.
            </p>
          </div>
        </div>
      </div>

      <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge size="sm">{event.type}</Badge>
            <Badge size="sm" tone="neutral">
              {event.mode}
            </Badge>
            <Badge
              size="sm"
              tone={event.price === "Free" ? "success" : "neutral"}
            >
              {event.price}
            </Badge>
          </div>
          <ButtonLink href={`/events/${event.id}`} variant="ghost" size="sm">
            View Event →
          </ButtonLink>
        </div>
        <h2 className="text-body text-text-primary font-semibold">
          {event.title}
        </h2>
        <p className="text-small text-text-secondary flex items-center gap-2">
          <Icon icon={Calendar} size="sm" />
          {event.date} · {event.time} · {event.mode}
        </p>
        <div className="border-border-light flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            <Avatar alt={event.organizer.name} initials="GC" size="sm" />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-small text-text-primary font-semibold">
                  {event.organizer.name}
                </p>
                <Badge tone="success" variant="muted" size="sm">
                  Verified
                </Badge>
              </div>
              <p className="text-small text-text-secondary">
                Event Organizer · {event.organizer.title} ·{" "}
                {event.organizer.eventsHosted} events hosted
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-border-light bg-surface-light space-y-4 rounded-md border p-6">
        <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
          What They Need
        </p>
        <div className="flex items-start gap-3">
          <Icon icon={Mic} size="md" className="text-text-secondary mt-0.5" />
          <div>
            <p className="text-body text-text-primary font-semibold">
              {categoryLabel}
            </p>
            <p className="text-body text-text-secondary">
              {categoryIntro[request.category]}
            </p>
          </div>
        </div>
        <blockquote className="bg-bg-light text-body text-text-secondary rounded-md p-4 italic">
          &ldquo;{request.message}&rdquo;
        </blockquote>
        <div className="border-border-light grid gap-4 border-t pt-4 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Icon
              icon={Calendar}
              size="sm"
              className="text-text-secondary mt-0.5"
            />
            <div>
              <p className="text-small text-text-secondary">
                Response deadline
              </p>
              <p className="text-body text-text-primary font-semibold">
                {event.registrationCloses}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Icon
              icon={Clock}
              size="sm"
              className="text-text-secondary mt-0.5"
            />
            <div>
              <p className="text-small text-text-secondary">Status</p>
              <p className="text-body text-text-primary font-semibold capitalize">
                {status}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ResponseForm
        requestId={request.id}
        status={status}
        respondedAt={respondedAt}
        responseMessage={request.responseMessage}
        onRespond={handleRespond}
      />
    </div>
  );
}

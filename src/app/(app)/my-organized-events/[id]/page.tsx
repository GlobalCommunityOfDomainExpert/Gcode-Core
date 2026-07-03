"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Compass } from "lucide-react";
import { Badge, Button, ButtonLink } from "@/components/atoms";
import {
  Banner,
  Breadcrumb,
  EmptyState,
  Modal,
  Tabs,
} from "@/components/molecules";
import { useShallow } from "zustand/react/shallow";
import { Attendee, getAttendeesByEvent } from "@/lib/attendees";
import { eventTypeTone, MockEvent } from "@/lib/mock-events";
import { useCommunityRequestsStore } from "@/store/community-requests-store";
import { useOrganizedEventsStore } from "@/store/organized-events-store";
import { AttendeesTab } from "./_components/attendees-tab";
import { CommunicationTab } from "./_components/communication-tab";
import { CommunityTab } from "./_components/community-tab";
import { OverviewTab } from "./_components/overview-tab";
import { SettingsTab } from "./_components/settings-tab";
import { SelectedStakeholder } from "../_components/types";

function OrganizedEventDetailView({ eventId }: { eventId: string }) {
  const event = useOrganizedEventsStore((state) =>
    state.events.find((item) => item.id === eventId),
  );
  const updateEvent = useOrganizedEventsStore((state) => state.updateEvent);
  const cancelEvent = useOrganizedEventsStore((state) => state.cancelEvent);
  const requests = useCommunityRequestsStore(
    useShallow((state) =>
      state.requests.filter((request) => request.eventId === eventId),
    ),
  );
  const addRequest = useCommunityRequestsStore((state) => state.addRequest);
  const nudgeRequest = useCommunityRequestsStore((state) => state.nudgeRequest);
  const confirmRequest = useCommunityRequestsStore(
    (state) => state.confirmRequest,
  );
  const removeRequest = useCommunityRequestsStore(
    (state) => state.removeRequest,
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<Set<string>>(
    new Set(),
  );
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!event) return null;

  const attendees: Attendee[] = getAttendeesByEvent(event.id);
  const isCancelled = event.status === "cancelled";

  const tabItems = [
    { value: "overview", label: "Overview" },
    { value: "attendees", label: `Attendees (${attendees.length})` },
    { value: "communication", label: "Communication" },
    { value: "settings", label: "Settings" },
    { value: "community", label: `Community (${requests.length})` },
  ];

  function handleSave(updates: Partial<MockEvent>) {
    updateEvent(eventId, updates);
  }

  function handleConfirmCancel() {
    cancelEvent(eventId);
    setShowCancelModal(false);
  }

  function handleNudge(id: string) {
    nudgeRequest(id);
  }

  function handleConfirmRequest(id: string) {
    confirmRequest(id);
  }

  function handleRemoveRequest(id: string) {
    removeRequest(id);
  }

  function handleAddRequests(selected: SelectedStakeholder[]) {
    selected.forEach((item) => {
      addRequest({
        eventId,
        stakeholderId: item.stakeholderId,
        category: item.category,
        message: item.message,
      });
    });
  }

  return (
    <>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Organizing", href: "/my-organized-events" },
            { label: event.title },
          ]}
        />

        {isCancelled && (
          <Banner tone="danger">
            This event has been cancelled and is no longer accepting
            registrations.
          </Banner>
        )}

        <div className="border-border-light bg-surface-light rounded-md border p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {!isCancelled && (
                  <Badge variant="muted" tone="success" size="sm">
                    ● Live
                  </Badge>
                )}
                <Badge tone={eventTypeTone[event.type]} size="sm">
                  {event.type}
                </Badge>
                <Badge tone="neutral" size="sm">
                  {event.mode}
                </Badge>
                <Badge
                  tone={event.price === "Free" ? "success" : "neutral"}
                  size="sm"
                >
                  {event.price}
                </Badge>
                {isCancelled && (
                  <Badge tone="danger" size="sm">
                    Cancelled
                  </Badge>
                )}
              </div>
              <h1 className="text-heading text-text-primary font-extrabold">
                {event.title}
              </h1>
              <p className="text-small text-text-secondary">
                {event.date} · {event.time} · {event.mode}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-5">
              <div className="text-center">
                <p className="text-heading text-text-primary font-extrabold">
                  {event.registeredCount}
                </p>
                <p className="text-small text-text-secondary tracking-wide uppercase">
                  Registered
                </p>
              </div>
              {event.capacity !== undefined && (
                <>
                  <div className="bg-border-light h-10 w-px" />
                  <div className="text-center">
                    <p className="text-heading text-text-primary font-extrabold">
                      {event.capacity}
                    </p>
                    <p className="text-small text-text-secondary tracking-wide uppercase">
                      Capacity
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="border-border-light mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
            <ButtonLink
              href={`/events/${event.id}`}
              variant="secondary"
              size="sm"
            >
              View Public Page →
            </ButtonLink>
            {!isCancelled && (
              <>
                <ButtonLink
                  href={`/my-organized-events/${event.id}/edit`}
                  variant="secondary"
                  size="sm"
                >
                  Edit Event →
                </ButtonLink>
                <Button
                  variant="danger-ghost"
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Event
                </Button>
              </>
            )}
          </div>
        </div>

        <div
          className={`border-border-light bg-surface-light rounded-md border p-4 ${
            isCancelled ? "pointer-events-none opacity-50 grayscale" : ""
          }`}
        >
          <Tabs items={tabItems} value={activeTab} onChange={setActiveTab} />
          <div className="mt-4">
            {activeTab === "overview" && (
              <OverviewTab
                event={event}
                attendees={attendees}
                onNavigateToCommunication={() => setActiveTab("communication")}
              />
            )}
            {activeTab === "attendees" && (
              <AttendeesTab
                event={event}
                attendees={attendees}
                selectedIds={selectedAttendeeIds}
                onSelectedIdsChange={setSelectedAttendeeIds}
                onNavigateToCommunication={() => setActiveTab("communication")}
              />
            )}
            {activeTab === "communication" && (
              <CommunicationTab
                event={event}
                attendees={attendees}
                selectedIds={selectedAttendeeIds}
              />
            )}
            {activeTab === "settings" && (
              <SettingsTab
                event={event}
                onSave={handleSave}
                onRequestCancel={() => setShowCancelModal(true)}
              />
            )}
            {activeTab === "community" && (
              <CommunityTab
                event={event}
                requests={requests}
                onNudge={handleNudge}
                onConfirm={handleConfirmRequest}
                onRemove={handleRemoveRequest}
                onAddRequests={handleAddRequests}
              />
            )}
          </div>
        </div>
      </div>

      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel this event?"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCancelModal(false)}
            >
              Keep event
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmCancel}>
              Cancel Event
            </Button>
          </>
        }
      >
        This removes the event from active registration and marks it cancelled
        on its public page. This can&apos;t be undone.
      </Modal>
    </>
  );
}

export default function OrganizedEventDetailPage() {
  const params = useParams<{ id: string }>();
  const event = useOrganizedEventsStore((state) =>
    state.events.find((item) => item.id === params.id),
  );

  if (!event) {
    return (
      <div className="mx-auto max-w-md">
        <EmptyState
          icon={Compass}
          title="Event not found"
          description="This event may not exist yet, or your session was reset. In-memory data resets on a full page refresh."
          action={
            <ButtonLink href="/my-organized-events" variant="primary">
              Back to Organizing
            </ButtonLink>
          }
        />
      </div>
    );
  }

  return <OrganizedEventDetailView eventId={event.id} />;
}

import { useState } from "react";
import { Button, ButtonLink, Progress, Switch } from "@/components/atoms";
import { StatCard } from "@/components/molecules";
import {
  ATTENDEES_CSV_HEADERS,
  Attendee,
  attendeesCsvRows,
} from "@/lib/attendees";
import { downloadCsv } from "@/lib/csv";
import { Event } from "@/lib/event";
import { updateEvent } from "@/lib/api/events";
import { RegistrationTrendChart } from "./registration-trend-chart";

export interface OverviewTabProps {
  event: Event;
  attendees: Attendee[];
  onNavigateToCommunication: () => void;
  // Called after the runtime open/close toggle below writes successfully,
  // so the parent re-fetches and this tab re-renders with the new state.
  onEventChanged: () => void | Promise<void>;
}

function daysLeft(event: Event): number | null {
  const parsed = new Date(event.date);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);
  return Math.max(
    0,
    Math.round((parsed.getTime() - today.getTime()) / 86_400_000),
  );
}

export function OverviewTab({
  event,
  attendees,
  onNavigateToCommunication,
  onEventChanged,
}: OverviewTabProps) {
  const [togglingCategory, setTogglingCategory] = useState<
    "ATTENDEE" | "PARTICIPANT" | null
  >(null);

  // Flips a pass open/closed at any time — including after
  // registration_deadline has passed — by reusing the plain PUT /events/:id
  // update call with just this one field set. No new endpoint needed.
  async function toggleRegistration(
    category: "ATTENDEE" | "PARTICIPANT",
    nextEnabled: boolean,
  ) {
    setTogglingCategory(category);
    try {
      await updateEvent(
        event.id,
        category === "ATTENDEE"
          ? { attendee_registration_enabled: nextEnabled ? 1 : 0 }
          : { participant_registration_enabled: nextEnabled ? 1 : 0 },
      );
      await onEventChanged();
    } finally {
      setTogglingCategory(null);
    }
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const registeredThisWeek = attendees.filter(
    (attendee) => new Date(attendee.registeredAt) >= oneWeekAgo,
  ).length;

  const paidAttendeeCount = attendees.filter(
    (attendee) =>
      attendee.ticketType === "Paid" && attendee.status !== "cancelled",
  ).length;
  const revenue = event.priceAmount ? event.priceAmount * paidAttendeeCount : 0;

  const capacityPercent = event.capacity
    ? Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))
    : null;

  const remainingDays = daysLeft(event);

  const participantRegistration = event.participantRegistration;
  const paidParticipantCount = attendees.filter(
    (attendee) =>
      attendee.category === "Participant" &&
      attendee.ticketType === "Paid" &&
      attendee.status !== "cancelled",
  ).length;
  const participantRevenue = participantRegistration.price
    ? participantRegistration.price * paidParticipantCount
    : 0;
  // Show the Participant stat block once it has ever had activity, even if
  // the organizer has since closed it — closing shouldn't hide history.
  const showParticipantStats =
    participantRegistration.enabled || participantRegistration.registeredCount > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Registered"
          value={event.registeredCount.toLocaleString()}
          sub={event.capacity ? `${event.capacity} capacity` : undefined}
          trend={
            registeredThisWeek > 0
              ? { value: `+${registeredThisWeek} this week`, tone: "success" }
              : undefined
          }
        />
        <StatCard
          label="Revenue"
          value={event.priceAmount ? `₹${revenue.toLocaleString()}` : "₹0"}
          sub={
            event.priceAmount
              ? `${paidAttendeeCount} paid tickets`
              : "Free event"
          }
        />
        <div className="border-border-light bg-surface-light rounded-md border p-4 transition-shadow hover:shadow-md">
          <p className="text-small text-text-secondary font-medium tracking-wide uppercase">
            Capacity
          </p>
          <span className="text-heading text-text-primary mt-1 block font-extrabold">
            {capacityPercent !== null ? `${capacityPercent}%` : "Unlimited"}
          </span>
          {capacityPercent !== null && (
            <Progress
              value={capacityPercent}
              className="mt-2"
              label="Capacity filled"
            />
          )}
        </div>
        <StatCard
          label="Days Left"
          value={remainingDays !== null ? String(remainingDays) : "—"}
          sub={`Closes ${event.attendeeRegistration.registrationCloses}`}
        />
      </div>

      {showParticipantStats && (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label={`${participantRegistration.label} Registered`}
            value={participantRegistration.registeredCount.toLocaleString()}
            sub={
              participantRegistration.capacity
                ? `${participantRegistration.capacity} capacity`
                : "Unlimited capacity"
            }
          />
          <StatCard
            label={`${participantRegistration.label} Revenue`}
            value={
              participantRegistration.price
                ? `₹${participantRevenue.toLocaleString()}`
                : "₹0"
            }
            sub={
              participantRegistration.price
                ? `${paidParticipantCount} paid`
                : "Free pass"
            }
          />
        </div>
      )}

      <div>
        <p className="text-small text-text-secondary mb-3 flex items-center gap-2 font-bold tracking-widest uppercase">
          Registration <span className="bg-border-light h-px flex-1" />
        </p>
        <div className="border-border-light bg-surface-light flex flex-wrap gap-6 rounded-md border p-4">
          <Switch
            label={`${event.attendeeRegistration.label} pass: ${event.attendeeRegistration.enabled ? "Open" : "Closed"}`}
            checked={event.attendeeRegistration.enabled}
            disabled={togglingCategory !== null}
            onChange={(e) => toggleRegistration("ATTENDEE", e.target.checked)}
          />
          {showParticipantStats && (
            <Switch
              label={`${event.participantRegistration.label} pass: ${event.participantRegistration.enabled ? "Open" : "Closed"}`}
              checked={event.participantRegistration.enabled}
              disabled={togglingCategory !== null}
              onChange={(e) => toggleRegistration("PARTICIPANT", e.target.checked)}
            />
          )}
        </div>
        <p className="text-small text-text-secondary mt-2">
          Closing a pass stops new registrations immediately — works any
          time, even after the registration deadline has passed.
        </p>
      </div>

      <RegistrationTrendChart attendees={attendees} />

      <div>
        <p className="text-small text-text-secondary mb-3 flex items-center gap-2 font-bold tracking-widest uppercase">
          Quick Actions <span className="bg-border-light h-px flex-1" />
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToCommunication}
          >
            📢 Send Announcement
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              downloadCsv(
                `${event.id}-attendees.csv`,
                ATTENDEES_CSV_HEADERS,
                attendeesCsvRows(attendees),
              )
            }
          >
            ⬇ Export CSV
          </Button>
          <ButtonLink
            href={`/my-organized-events/${event.id}/edit`}
            variant="secondary"
            size="sm"
          >
            ✏ Edit Event
          </ButtonLink>
          <ButtonLink
            href={`/events/${event.id}`}
            variant="secondary"
            size="sm"
          >
            ↗ View Public Page
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

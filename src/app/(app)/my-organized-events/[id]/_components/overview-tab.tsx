import { Button, ButtonLink, Progress } from "@/components/atoms";
import { StatCard } from "@/components/molecules";
import {
  ATTENDEES_CSV_HEADERS,
  Attendee,
  attendeesCsvRows,
} from "@/lib/attendees";
import { downloadCsv } from "@/lib/csv";
import { Event } from "@/lib/event";
import { RegistrationTrendChart } from "./registration-trend-chart";

export interface OverviewTabProps {
  event: Event;
  attendees: Attendee[];
  onNavigateToCommunication: () => void;
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
}: OverviewTabProps) {
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
          sub={`Closes ${event.registrationCloses}`}
        />
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

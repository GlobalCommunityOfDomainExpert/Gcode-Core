import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  Users,
  ArrowRight,
} from "lucide-react";
import { Avatar, Badge, Button, ButtonLink, Icon } from "@/components/atoms";
import { AvatarGroup, Breadcrumb } from "@/components/molecules";
import { Timeline } from "@/components/molecules";
import { AuthenticatedShell } from "@/app/_components/authenticated-shell";
import { eventTypeTone, getEventById, mockEvents } from "@/lib/mock-events";
import { ShareEventCard } from "./_components/share-event-card";

const placeholderAttendees = [
  { alt: "Attendee", initials: "A" },
  { alt: "Attendee", initials: "B" },
  { alt: "Attendee", initials: "C" },
];

function DetailItem({
  icon,
  label,
  value,
  description,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon icon={icon} size="sm" className="text-text-secondary mt-0.5" />
      <div>
        <p className="text-small text-text-secondary">{label}</p>
        <p className="text-body text-text-primary font-semibold">{value}</p>
        <p className="text-small text-text-secondary">{description}</p>
      </div>
    </div>
  );
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <AuthenticatedShell>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Events", href: "/events" },
            { label: event.type, href: "/events" },
            { label: event.title },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="bg-primary relative flex aspect-[3/1] items-end rounded-md p-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="solid" tone="neutral">
                  {event.type}
                </Badge>
                <Badge variant="solid" tone="neutral">
                  {event.mode}
                </Badge>
                <Badge variant="solid" tone="success">
                  {event.price}
                </Badge>
              </div>
              {event.featured && (
                <Badge
                  variant="solid"
                  tone="warning"
                  className="absolute top-4 right-4"
                >
                  Featured
                </Badge>
              )}
            </div>

            <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-6">
              <h1 className="text-heading text-text-primary font-extrabold">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-2">
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
              </div>
              <div className="border-border-light space-y-2 border-t pt-4">
                <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
                  About this event
                </p>
                {event.description.map((paragraph, index) => (
                  <p key={index} className="text-body text-text-secondary">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="border-border-light bg-surface-light space-y-4 rounded-md border p-6">
              <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
                Event Details
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={Calendar}
                  label="Date & Time"
                  value={event.date}
                  description={event.time}
                />
                <DetailItem
                  icon={Clock}
                  label="Duration"
                  value={event.duration}
                  description=""
                />
                <DetailItem
                  icon={MapPin}
                  label="Mode"
                  value={event.mode}
                  description={event.location}
                />
                <DetailItem
                  icon={Users}
                  label="Team Size"
                  value={event.teamSize}
                  description=""
                />
              </div>
            </div>

            <div className="border-border-light bg-surface-light space-y-4 rounded-md border p-6">
              <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
                Agenda
              </p>
              <Timeline
                items={event.agenda.map((item, index) => ({
                  title: `${item.time} — ${item.title}`,
                  description: item.description,
                  active: index === 0,
                }))}
              />
            </div>

            <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-6">
              <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
                Organized By
              </p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar alt={event.organizer.name} initials="GC" size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-body text-text-primary font-semibold">
                        {event.organizer.name}
                      </p>
                      {event.organizer.verified && (
                        <Badge tone="success" variant="muted" size="sm">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-small text-text-secondary">
                      {event.organizer.eventsHosted} events hosted ·{" "}
                      {event.organizer.attendees.toLocaleString()} attendees ·{" "}
                      {event.organizer.title}
                    </p>
                  </div>
                </div>
                <ButtonLink
                  href="/dashboard"
                  variant="ghost"
                  size="sm"
                  className="inline-flex items-center gap-1"
                >
                  View Profile
                  <Icon icon={ArrowRight} size="sm" />
                </ButtonLink>
              </div>
            </div>

            <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-6">
              <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
                Terms &amp; Eligibility
              </p>
              <ul className="text-body text-text-secondary list-disc space-y-1.5 pl-5">
                {event.terms.map((term) => (
                  <li key={term}>{term}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="border-border-light bg-surface-light space-y-4 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <span className="text-heading text-text-primary font-extrabold">
                  {event.price}
                </span>
                {event.spotsLeft !== undefined && (
                  <span className="text-small text-warning font-semibold">
                    {event.spotsLeft} spots left
                  </span>
                )}
              </div>
              <p className="text-small text-text-secondary">
                Registration closes {event.registrationCloses}
              </p>
              <AvatarGroup
                items={placeholderAttendees}
                overflowLabel={`+${event.registeredCount} already registered`}
              />
              <ButtonLink
                href={`/events/${event.id}/registered`}
                variant="primary"
                className="w-full"
              >
                Register Now <Icon icon={ArrowRight} size="sm" />
              </ButtonLink>
              <Button variant="secondary" className="w-full">
                📅 Add to Calendar
              </Button>
              {event.capacity && (
                <p className="text-small text-text-secondary text-center">
                  {event.capacity} total capacity · {event.registeredCount}{" "}
                  registered · {event.spotsLeft} open
                </p>
              )}
            </div>

            <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-4">
              <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
                Event Info
              </p>
              <div className="space-y-3">
                <DetailItem
                  icon={Calendar}
                  label=""
                  value={event.date}
                  description={event.time}
                />
                <DetailItem
                  icon={MapPin}
                  label=""
                  value={event.mode}
                  description={event.location}
                />
                {event.certificate && (
                  <DetailItem
                    icon={Award}
                    label=""
                    value="Certificate"
                    description="Issued on completion"
                  />
                )}
              </div>
            </div>

            <ShareEventCard url={`https://gcode.in/events/${event.id}`} />
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  );
}

export function generateStaticParams() {
  return mockEvents.map((event) => ({ id: event.id }));
}

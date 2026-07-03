"use client";

import { useParams } from "next/navigation";
import { Calendar, Clock, MapPin, Award, Users, Compass } from "lucide-react";
import { Avatar, Badge, Button, ButtonLink, Icon } from "@/components/atoms";
import {
  AvatarGroup,
  Banner,
  Breadcrumb,
  EmptyState,
} from "@/components/molecules";
import { Timeline } from "@/components/molecules";
import { getAttendeesByEvent } from "@/lib/attendees";
import { downloadIcs } from "@/lib/calendar";
import { getEventColor } from "@/lib/event-color";
import { eventTypeTone } from "@/lib/mock-events";
import { useAnyEventById } from "@/store/organized-events-store";
import { ShareEventCard } from "./_components/share-event-card";

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

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const event = useAnyEventById(params.id);
  const attendees = event
    ? getAttendeesByEvent(event.id)
        .slice(0, 3)
        .map((attendee) => ({
          alt: attendee.name,
          initials: attendee.avatarInitials,
        }))
    : [];

  if (!event) {
    return (
      <div className="mx-auto max-w-md">
        <EmptyState
          icon={Compass}
          title="Event not found"
          description="This event may not exist, or in-memory data was reset by a full page refresh."
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
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Events", href: "/events" },
          { label: event.type, href: "/events" },
          { label: event.title },
        ]}
      />

      {event.status === "cancelled" && (
        <Banner tone="danger">
          This event has been cancelled by the organizer.
        </Banner>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div
            className="relative flex aspect-[3/1] items-end overflow-hidden rounded-md p-4"
            style={
              event.coverImageUrl
                ? undefined
                : { backgroundColor: getEventColor(event.id) }
            }
          >
            {event.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.coverImageUrl}
                alt={event.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="relative flex flex-wrap gap-2">
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

          {event.agenda.length > 0 && (
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
          )}

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
            </div>
          </div>

          {event.socialLinks && event.socialLinks.length > 0 && (
            <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-6">
              <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
                Social Links
              </p>
              <div className="flex flex-wrap gap-2">
                {event.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-border-light text-body text-text-primary hover:bg-bg-light rounded-sm border px-3 py-1.5 font-medium"
                  >
                    {link.platform || link.url}
                  </a>
                ))}
              </div>
            </div>
          )}

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
            {attendees.length > 0 && (
              <AvatarGroup
                items={attendees}
                overflowLabel={`+${event.registeredCount} already registered`}
              />
            )}
            {event.status === "cancelled" ? (
              <Button variant="secondary" className="w-full" disabled>
                Event Cancelled
              </Button>
            ) : (
              <ButtonLink
                href={`/events/${event.id}/registered`}
                variant="primary"
                className="w-full"
              >
                Register Now →
              </ButtonLink>
            )}
            <button
              type="button"
              onClick={() => downloadIcs(event)}
              className="border-border-light text-body text-text-primary hover:bg-bg-light w-full rounded-sm border py-2 text-center font-medium"
            >
              📅 Add to Calendar
            </button>
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
  );
}

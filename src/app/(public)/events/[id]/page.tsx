"use client";

import { useParams } from "next/navigation";
import { Calendar, Clock, MapPin, Award, Users, Compass } from "lucide-react";
import {
  Badge,
  Button,
  ButtonLink,
  Icon,
  SectionLabel,
} from "@/components/atoms";
import {
  AvatarGroup,
  Banner,
  Breadcrumb,
  EventBadgeRow,
  NotFoundState,
} from "@/components/molecules";
import { Timeline } from "@/components/molecules";
import { getAttendeesByEvent } from "@/lib/attendees";
import { getEventColor } from "@/lib/event-color";
import { eventTypeTone, Event, EventTimelineItem } from "@/lib/event";
import { useEvent } from "@/hooks/use-event";
import { ShareEventCard } from "./_components/share-event-card";

// "14:30" / "00:00" -> "2:30 PM" / "12:00 AM". Handles the 12/0 hour edge.
function to12Hour(hhmm: string): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// Bucket timeline items by calendar date so multi-day agendas get a header per
// day. Single-day agendas produce one group with no label.
function groupByDay(items: EventTimelineItem[]) {
  const order: string[] = [];
  const buckets = new Map<string, EventTimelineItem[]>();
  for (const item of items) {
    const key = item.date || "";
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(item);
  }
  const multiDay = order.filter((d) => d).length > 1;
  return order.map((day) => ({
    day,
    label:
      multiDay && day
        ? new Intl.DateTimeFormat("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            timeZone: "UTC",
          }).format(new Date(day))
        : "",
    items: buckets.get(day)!,
  }));
}

// Whole days between now and an ISO deadline. Null if no deadline is set.
function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const diffMs = new Date(iso).getTime() - Date.now();
  return Math.ceil(diffMs / 86_400_000);
}

// event.time (if set) -> earliest agenda item's time (more descriptive) ->
// the organizer's free-text duration -> blank.
function resolveDisplayTime(event: Event): string {
  if (event.time) return event.time;
  const firstTimedItem = event.timeline.find((item) => item.time);
  if (firstTimedItem) return firstTimedItem.time;
  return event.durationText ?? "";
}

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
  const { event, status } = useEvent(params.id);
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
      <NotFoundState
        icon={Compass}
        title={status === "loading" ? "Loading event…" : "Event not found"}
        description={
          status === "loading"
            ? "Fetching this event."
            : "This event may not exist, or it couldn't be loaded."
        }
        actionHref="/events"
        actionLabel="Browse Events"
      />
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

      {event.status === "CANCELLED" && (
        <Banner tone="danger">
          This event has been cancelled by the organizer.
        </Banner>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div
            className="relative flex aspect-3/1 items-end overflow-hidden rounded-md p-4"
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
            <EventBadgeRow
              type={event.type}
              mode={event.mode}
              price={event.price}
              typeTone={eventTypeTone(event.type)}
            />
            <div className="border-border-light space-y-2 border-t pt-4">
              <SectionLabel>About this event</SectionLabel>
              {event.description.map((paragraph, index) => (
                <p key={index} className="text-body text-text-secondary">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="border-border-light bg-surface-light space-y-4 rounded-md border p-6">
            <SectionLabel>Event Details</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                icon={Calendar}
                label="Date & Time"
                value={event.date}
                description={resolveDisplayTime(event)}
              />
              <DetailItem
                icon={Clock}
                label="Duration"
                value={event.duration || event.durationText || "TBD"}
                description=""
              />
              <DetailItem
                icon={MapPin}
                label="Venue"
                value={event.location}
                description={event.mode}
              />
              <DetailItem
                icon={Users}
                label="Team Size"
                value={event.teamSize}
                description=""
              />
            </div>
          </div>

          {event.timeline.length > 0 && (
            <div className="border-border-light bg-surface-light space-y-5 rounded-md border p-6">
              <SectionLabel>Agenda</SectionLabel>
              {groupByDay(event.timeline).map((group, groupIndex) => (
                <div key={group.day} className="space-y-3">
                  {group.label && (
                    <div className="flex items-center gap-3">
                      <span className="text-small text-text-primary font-semibold">
                        {group.label}
                      </span>
                      <span className="bg-border-light h-px flex-1" />
                    </div>
                  )}
                  <Timeline
                    items={group.items.map((item, index) => ({
                      time: item.endTime
                        ? `${to12Hour(item.time)} – ${to12Hour(item.endTime)}`
                        : to12Hour(item.time),
                      title: item.title,
                      location: item.location,
                      description: item.description,
                      active: groupIndex === 0 && index === 0,
                    }))}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="bg-primary space-y-3 rounded-md p-6">
            <p className="text-small font-bold tracking-widest text-white/70 uppercase">
              About organizer
            </p>
            <img
              src="/app-logo.png"
              alt="GCODE"
              className="h-10 w-auto object-contain"
            />
            <p className="text-body text-white/80">
              GCODE, the Global Community of Domain Experts, is dedicated to
              fostering collaboration between startups, industry, and
              academia. We focus on creating unique partnerships by involving
              domain experts and interns to facilitate innovation and
              knowledge sharing. We offer advisory services and support
              connections between industry and academia to drive impactful
              collaborations. If you&apos;d like to learn more about
              scheduling with our domain experts, feel free to reach out.
            </p>
          </div>

          {event.socialLinks && event.socialLinks.length > 0 && (
            <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-6">
              <SectionLabel>Social Links</SectionLabel>
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

          <div className="border-border-light bg-surface-light space-y-4 rounded-md border p-6">
            <div className="space-y-2">
              <SectionLabel>Eligibility</SectionLabel>
              <ul className="text-body text-text-secondary list-disc space-y-1.5 pl-5">
                {event.eligibility.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <SectionLabel>Terms &amp; Conditions</SectionLabel>
              <ul className="text-body text-text-secondary list-disc space-y-1.5 pl-5">
                {event.terms.map((term) => (
                  <li key={term}>{term}</li>
                ))}
              </ul>
            </div>
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
            {(() => {
              const days = daysUntil(event.registrationDeadlineIso);
              if (days === null) return null;
              return (
                <p className="text-small text-text-secondary">
                  {days <= 0
                    ? "Registration closed"
                    : `Registration closes in ${days} day${days === 1 ? "" : "s"}`}
                </p>
              );
            })()}
            {attendees.length > 0 && (
              <AvatarGroup
                items={attendees}
                overflowLabel={`+${event.registeredCount} already registered`}
              />
            )}
            {event.status === "CANCELLED" ? (
              <Button variant="secondary" className="w-full" disabled>
                Event Cancelled
              </Button>
            ) : (
              <ButtonLink
                href={`/events/${event.id}/register`}
                variant="primary"
                className="w-full"
              >
                Book Tickets
              </ButtonLink>
            )}
            {event.capacity && (
              <p className="text-small text-text-secondary text-center">
                {event.capacity} total capacity · {event.registeredCount}{" "}
                registered
              </p>
            )}
          </div>

          <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-4">
            <SectionLabel>Event Info</SectionLabel>
            <div className="space-y-3">
              <DetailItem
                icon={Calendar}
                label=""
                value={event.date}
                description={resolveDisplayTime(event)}
              />
              <DetailItem
                icon={MapPin}
                label=""
                value={event.location}
                description={event.mode}
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

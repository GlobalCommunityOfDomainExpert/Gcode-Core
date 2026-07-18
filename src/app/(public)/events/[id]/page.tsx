"use client";

import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Award, Users, Compass } from "lucide-react";
import { Button, ButtonLink, Icon, SectionLabel } from "@/components/atoms";
import {
  Banner,
  Breadcrumb,
  EventBadgeRow,
  NotFoundState,
  SelectableCard,
} from "@/components/molecules";
import { Timeline } from "@/components/molecules";
import { getEventColor } from "@/lib/event-color";
import {
  eventTypeTone,
  Event,
  EventTimelineItem,
  isRegistrationOpen,
} from "@/lib/event";
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
  const router = useRouter();
  const { event, status } = useEvent(params.id);

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
            className="relative flex aspect-8/3 items-end overflow-hidden rounded-md p-4"
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
              The GCODE Talent Ethos
            </p>
            <img
              src="/app-logo.png"
              alt="GCODE"
              className="h-10 w-auto object-contain"
            />
            <p className="text-body font-semibold text-white/90">
              Discover. Perform. Connect. Grow.
            </p>
            <p className="text-body text-white/80">
              At GCODE, we believe talent is just the beginning. Every
              performance is an opportunity to build confidence, every
              interaction is a chance to create meaningful connections, and
              every event opens doors to new opportunities.
            </p>
            <p className="text-body text-white/80">
              We provide a professional platform where individuals can showcase
              their talent, receive valuable recognition, learn from experienced
              mentors, connect with like-minded people, and become part of a
              thriving ecosystem that celebrates passion, creativity and
              continuous growth.
            </p>
            <p className="text-body text-white/80">
              Because at GCODE, talent doesn&apos;t end with applause—it begins
              with opportunity.
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
            {(() => {
              // "enabled" (organizer offers this pass at all) is separate
              // from "open right now" (within its own registration window) —
              // an enabled-but-not-yet-open or enabled-but-closed pass still
              // shows up here, just greyed out, instead of disappearing.
              const enabledPasses = [
                {
                  category: "PARTICIPANT" as const,
                  data: event.participantRegistration,
                },

                {
                  category: "ATTENDEE" as const,
                  data: event.attendeeRegistration,
                },
              ].filter((p) => p.data.enabled);
              const registrationClosed = enabledPasses.length === 0;
              const singlePass =
                enabledPasses.length === 1 ? enabledPasses[0].data : undefined;

              type WindowStatus =
                | { state: "not-open-yet"; days: number }
                | { state: "closed" }
                | { state: "closing-soon"; days: number }
                | { state: "open" };

              function windowStatus(
                data: Event["attendeeRegistration"],
              ): WindowStatus {
                const opensDays = daysUntil(data.registrationOpensIso);
                if (opensDays !== null && opensDays > 0) {
                  return { state: "not-open-yet", days: opensDays };
                }
                const closesDays = daysUntil(data.registrationDeadlineIso);
                if (closesDays !== null) {
                  return closesDays <= 0
                    ? { state: "closed" }
                    : { state: "closing-soon", days: closesDays };
                }
                return { state: "open" };
              }

              function windowStatusMeta(
                status: WindowStatus,
              ): string | undefined {
                if (status.state === "not-open-yet")
                  return `opens in ${status.days}d`;
                if (status.state === "closed") return "closed";
                if (status.state === "closing-soon")
                  return `closes in ${status.days}d`;
                return undefined;
              }

              function windowStatusMessage(
                status: WindowStatus,
              ): string | undefined {
                if (status.state === "not-open-yet")
                  return `Registration opens in ${status.days} day${status.days === 1 ? "" : "s"}`;
                if (status.state === "closed") return "Registration closed";
                if (status.state === "closing-soon")
                  return `Registration closes in ${status.days} day${status.days === 1 ? "" : "s"}`;
                return undefined;
              }

              return (
                <>
                  {singlePass ? (
                    <div className="flex items-center justify-between">
                      <span className="text-heading text-text-primary font-extrabold">
                        {singlePass.priceLabel}
                      </span>
                      {singlePass.spotsLeft !== undefined && (
                        <span className="text-small text-warning font-semibold">
                          {singlePass.spotsLeft} spots left
                        </span>
                      )}
                    </div>
                  ) : enabledPasses.length > 1 ? (
                    <>
                      <p className="text-body text-text-primary font-semibold">
                        How would you like to join?
                      </p>
                      <div className="space-y-3">
                        {enabledPasses.map(({ category, data }) => {
                          const status = windowStatus(data);
                          return (
                            <SelectableCard
                              key={category}
                              layout="horizontal"
                              title={data.label}
                              subtitle={data.description || undefined}
                              disabled={
                                status.state === "not-open-yet" ||
                                status.state === "closed"
                              }
                              meta={[
                                data.spotsLeft !== undefined
                                  ? `${data.priceLabel} · ${data.spotsLeft} left`
                                  : data.priceLabel,
                                windowStatusMeta(status),
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                              onSelect={() =>
                                router.push(
                                  `/events/${event.id}/register?category=${category}`,
                                )
                              }
                            />
                          );
                        })}
                      </div>
                    </>
                  ) : null}

                  {singlePass &&
                    (() => {
                      const message = windowStatusMessage(
                        windowStatus(singlePass),
                      );
                      if (!message) return null;
                      return (
                        <p className="text-small text-text-secondary">
                          {message}
                        </p>
                      );
                    })()}
                  {event.status === "CANCELLED" ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Event Cancelled
                    </Button>
                  ) : registrationClosed ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Registration Closed
                    </Button>
                  ) : singlePass && !isRegistrationOpen(singlePass) ? (
                    <Button variant="secondary" className="w-full" disabled>
                      {windowStatus(singlePass).state === "not-open-yet"
                        ? "Registration Not Yet Open"
                        : "Registration Closed"}
                    </Button>
                  ) : singlePass ? (
                    <ButtonLink
                      href={`/events/${event.id}/register`}
                      variant="primary"
                      className="w-full"
                    >
                      Book Tickets
                    </ButtonLink>
                  ) : null}
                  {singlePass?.capacity && (
                    <p className="text-small text-text-secondary text-center">
                      {singlePass.capacity} total capacity ·{" "}
                      {singlePass.registeredCount} registered
                    </p>
                  )}
                </>
              );
            })()}
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

          <ShareEventCard
            url={`https://gcode.in/events/${event.id}`}
            title={event.title}
          />
        </div>
      </div>
    </div>
  );
}

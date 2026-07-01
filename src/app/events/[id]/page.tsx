import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, Award, Users } from "lucide-react";
import { Avatar, Badge, ButtonLink, Icon } from "@/components/atoms";
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
      <Icon icon={icon} size="sm" className="mt-0.5 text-text-secondary" />
      <div>
        <p className="text-small text-text-secondary">{label}</p>
        <p className="text-body font-semibold text-text-primary">{value}</p>
        <p className="text-small text-text-secondary">{description}</p>
      </div>
    </div>
  );
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
            <div className="relative flex aspect-[3/1] items-end rounded-md bg-primary p-4">
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
                <Badge variant="solid" tone="warning" className="absolute right-4 top-4">
                  Featured
                </Badge>
              )}
            </div>

            <div className="space-y-3 rounded-md border border-border-light bg-surface-light p-6">
              <h1 className="text-heading font-extrabold text-text-primary">{event.title}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge tone={eventTypeTone[event.type]} size="sm">
                  {event.type}
                </Badge>
                <Badge tone="neutral" size="sm">
                  {event.mode}
                </Badge>
                <Badge tone={event.price === "Free" ? "success" : "neutral"} size="sm">
                  {event.price}
                </Badge>
              </div>
              <div className="space-y-2 border-t border-border-light pt-4">
                <p className="text-small font-bold uppercase tracking-widest text-text-secondary">
                  About this event
                </p>
                {event.description.map((paragraph, index) => (
                  <p key={index} className="text-body text-text-secondary">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-md border border-border-light bg-surface-light p-6">
              <p className="text-small font-bold uppercase tracking-widest text-text-secondary">
                Event Details
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem icon={Calendar} label="Date & Time" value={event.date} description={event.time} />
                <DetailItem icon={Clock} label="Duration" value={event.duration} description="" />
                <DetailItem icon={MapPin} label="Mode" value={event.mode} description={event.location} />
                <DetailItem icon={Users} label="Team Size" value={event.teamSize} description="" />
              </div>
            </div>

            <div className="space-y-4 rounded-md border border-border-light bg-surface-light p-6">
              <p className="text-small font-bold uppercase tracking-widest text-text-secondary">Agenda</p>
              <Timeline
                items={event.agenda.map((item, index) => ({
                  title: `${item.time} — ${item.title}`,
                  description: item.description,
                  active: index === 0,
                }))}
              />
            </div>

            <div className="space-y-3 rounded-md border border-border-light bg-surface-light p-6">
              <p className="text-small font-bold uppercase tracking-widest text-text-secondary">
                Organized By
              </p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar alt={event.organizer.name} initials="GC" size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-body font-semibold text-text-primary">{event.organizer.name}</p>
                      {event.organizer.verified && (
                        <Badge tone="success" variant="muted" size="sm">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-small text-text-secondary">
                      {event.organizer.eventsHosted} events hosted · {event.organizer.attendees.toLocaleString()}{" "}
                      attendees · {event.organizer.title}
                    </p>
                  </div>
                </div>
                <ButtonLink href="/dashboard" variant="ghost" size="sm">
                  View Profile →
                </ButtonLink>
              </div>
            </div>

            <div className="space-y-3 rounded-md border border-border-light bg-surface-light p-6">
              <p className="text-small font-bold uppercase tracking-widest text-text-secondary">
                Terms &amp; Eligibility
              </p>
              <ul className="list-disc space-y-1.5 pl-5 text-body text-text-secondary">
                {event.terms.map((term) => (
                  <li key={term}>{term}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="space-y-4 rounded-md border border-border-light bg-surface-light p-4">
              <div className="flex items-center justify-between">
                <span className="text-heading font-extrabold text-text-primary">{event.price}</span>
                {event.spotsLeft !== undefined && (
                  <span className="text-small font-semibold text-warning">{event.spotsLeft} spots left</span>
                )}
              </div>
              <p className="text-small text-text-secondary">Registration closes {event.registrationCloses}</p>
              <AvatarGroup
                items={placeholderAttendees}
                overflowLabel={`+${event.registeredCount} already registered`}
              />
              <ButtonLink href={`/events/${event.id}/registered`} variant="primary" className="w-full">
                Register Now →
              </ButtonLink>
              <button
                type="button"
                className="w-full rounded-sm border border-border-light py-2 text-center text-body font-medium text-text-primary hover:bg-bg-light"
              >
                📅 Add to Calendar
              </button>
              {event.capacity && (
                <p className="text-center text-small text-text-secondary">
                  {event.capacity} total capacity · {event.registeredCount} registered ·{" "}
                  {event.spotsLeft} open
                </p>
              )}
            </div>

            <div className="space-y-3 rounded-md border border-border-light bg-surface-light p-4">
              <p className="text-small font-bold uppercase tracking-widest text-text-secondary">Event Info</p>
              <div className="space-y-3">
                <DetailItem icon={Calendar} label="" value={event.date} description={event.time} />
                <DetailItem icon={MapPin} label="" value={event.mode} description={event.location} />
                {event.certificate && (
                  <DetailItem icon={Award} label="" value="Certificate" description="Issued on completion" />
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

import { notFound } from "next/navigation";
import { Calendar, Coins, Mic, Clock } from "lucide-react";
import { Avatar, Badge, ButtonLink, Icon } from "@/components/atoms";
import { Breadcrumb } from "@/components/molecules";
import { AuthenticatedShell } from "@/app/_components/authenticated-shell";
import { getEventById, mockEvents } from "@/lib/mock-events";
import { ResponseForm } from "./_components/response-form";

export default async function CommunityRequestPage({
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
      <div className="mx-auto max-w-2xl space-y-6">
        <Breadcrumb
          items={[
            { label: "Community Request" },
            { label: "GCODE Community Help" },
          ]}
        />

        <div className="bg-primary space-y-3 rounded-md p-6">
          <Badge variant="solid" tone="neutral">
            Domain Expert · Guest Speaker
          </Badge>
          <div className="flex items-start gap-3">
            <Icon icon={Mic} size="lg" className="mt-1 text-white" />
            <div>
              <h1 className="text-large font-bold text-white">
                You&apos;ve been invited to help with an event
              </h1>
              <p className="text-body text-white/70">
                An organizer in the GCODE community needs your expertise.
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
            <span className="text-small text-text-secondary">
              6 others interested
            </span>
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
                Domain Expert — Guest Speaker
              </p>
              <p className="text-body text-text-secondary">
                Attend the event and present or speak on a relevant topic.
                Coordinate with the organizer on topic, slot, and duration
                beforehand.
              </p>
            </div>
          </div>
          <blockquote className="bg-bg-light text-body text-text-secondary rounded-md p-4 italic">
            &ldquo;We&apos;re looking for experts with experience in deep-tech,
            AI/ML, or hardware startups to speak at our hackathon kickoff
            session on {event.date}. Slot is 30 minutes including Q&amp;A.
            We&apos;d love someone who can inspire builders!&rdquo;
          </blockquote>
          <div className="border-border-light grid gap-4 border-t pt-4 sm:grid-cols-3">
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
                <p className="text-small text-text-secondary">
                  Time commitment
                </p>
                <p className="text-body text-text-primary font-semibold">
                  ~30 min on event day
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Icon
                icon={Coins}
                size="sm"
                className="text-text-secondary mt-0.5"
              />
              <div>
                <p className="text-small text-text-secondary">Compensation</p>
                <p className="text-body text-text-primary font-semibold">
                  Voluntary · GCODE recognition
                </p>
              </div>
            </div>
          </div>
        </div>

        <ResponseForm />
      </div>
    </AuthenticatedShell>
  );
}

export function generateStaticParams() {
  return mockEvents.map((event) => ({ id: event.id }));
}

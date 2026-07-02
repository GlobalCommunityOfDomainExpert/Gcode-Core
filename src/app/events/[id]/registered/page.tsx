import { notFound } from "next/navigation";
import {
  Calendar,
  CalendarPlus,
  Check,
  MessageCircle,
  MapPin,
} from "lucide-react";
import {
  Badge,
  BookingRef,
  ButtonLink,
  Icon,
  QrPlaceholder,
} from "@/components/atoms";
import { AuthenticatedShell } from "@/app/_components/authenticated-shell";
import { getEventById, mockEvents } from "@/lib/mock-events";

const nextSteps = [
  {
    label: "Registration complete",
    description: "Confirmation sent to your email",
    done: true,
  },
  {
    label: "Save the date",
    description: "Add to your calendar so you don't miss it",
    action: "Add",
    href: "#",
    icon: CalendarPlus,
  },
  {
    label: "Join the community",
    description: "GCODE WhatsApp group for this event",
    action: "Join",
    href: "#",
    icon: MessageCircle,
  },
];

export default async function EventRegisteredPage({
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
        <div className="border-success/20 bg-success-light flex items-start gap-4 rounded-md border p-6">
          <div className="bg-success flex size-10 shrink-0 items-center justify-center rounded-full text-white">
            <Icon icon={Check} size="md" />
          </div>
          <div>
            <h1 className="text-large text-success font-bold">
              You&apos;re registered!
            </h1>
            <p className="text-body text-text-primary">
              A confirmation has been sent to your email address.
            </p>
            <p className="text-small text-text-secondary">
              Registration confirmed
            </p>
          </div>
        </div>

        <div className="border-border-light bg-surface-light overflow-hidden rounded-md border">
          <div className="bg-primary px-4 py-3">
            <Badge variant="solid" tone="neutral">
              {event.type}
            </Badge>
          </div>
          <div className="space-y-2 p-4">
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
              <ButtonLink
                href={`/events/${event.id}`}
                variant="ghost"
                size="sm"
              >
                View Event →
              </ButtonLink>
            </div>
            <h2 className="text-body text-text-primary font-semibold">
              {event.title}
            </h2>
            <p className="text-small text-text-secondary flex items-center gap-2">
              <Icon icon={Calendar} size="sm" />
              {event.date} · {event.time}
            </p>
            <p className="text-small text-text-secondary flex items-center gap-2">
              <Icon icon={MapPin} size="sm" />
              {event.location}
            </p>
          </div>
        </div>

        <div className="border-border-light bg-surface-light space-y-4 rounded-md border p-6">
          <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
            Your Ticket
          </p>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <QrPlaceholder />
            <div className="space-y-2">
              <p className="text-small text-text-secondary">
                Booking Reference
              </p>
              <BookingRef>GCODE-2026-48291</BookingRef>
              <p className="text-small text-text-secondary">
                Present this at the event check-in or share your QR code.
              </p>
              <ButtonLink href="#" variant="primary" size="sm">
                Download Ticket
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-6">
          <p className="text-small text-text-secondary font-bold tracking-widest uppercase">
            What&apos;s Next
          </p>
          <div className="space-y-3">
            {nextSteps.map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                    step.done
                      ? "bg-success text-white"
                      : "border-border-light text-text-secondary border"
                  }`}
                >
                  {step.done && <Icon icon={Check} size="sm" />}
                </div>
                <div className="flex-1">
                  <p className="text-body text-text-primary font-medium">
                    {step.label}
                  </p>
                  <p className="text-small text-text-secondary">
                    {step.description}
                  </p>
                </div>
                {step.action && (
                  <ButtonLink
                    href={step.href ?? "#"}
                    variant="secondary"
                    size="sm"
                  >
                    {step.action}
                  </ButtonLink>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/my-events" variant="primary" className="flex-1">
            View My Events →
          </ButtonLink>
          <ButtonLink href="/events" variant="secondary" className="flex-1">
            Browse More Events
          </ButtonLink>
        </div>
      </div>
    </AuthenticatedShell>
  );
}

export function generateStaticParams() {
  return mockEvents.map((event) => ({ id: event.id }));
}

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  CalendarPlus,
  Check,
  Compass,
  MessageCircle,
  MapPin,
} from "lucide-react";
import {
  Badge,
  BookingRef,
  Button,
  ButtonLink,
  Icon,
  QrPlaceholder,
  SectionLabel,
} from "@/components/atoms";
import { EventBadgeRow, NotFoundState } from "@/components/molecules";
import { downloadIcs } from "@/lib/calendar";
import { useEvent } from "@/hooks/use-event";

export default function EventRegisteredPage() {
  const params = useParams<{ id: string }>();
  const { event, status } = useEvent(params.id);
  const [joinedCommunity, setJoinedCommunity] = useState(false);

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

  const bookingRef = `GCODE-2026-${event.id.slice(-6).toUpperCase()}`;

  function downloadTicket() {
    if (!event) return;
    const ticketText = [
      "GCODE EVENT TICKET",
      "",
      `Event: ${event.title}`,
      `Date: ${event.date} · ${event.time}`,
      `Location: ${event.location}`,
      `Booking Reference: ${bookingRef}`,
      "",
      "Present this ticket at the event check-in.",
    ].join("\n");
    const blob = new Blob([ticketText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${bookingRef}-ticket.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

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
      icon: CalendarPlus,
      onAction: () => downloadIcs(event),
      done: false,
    },
    {
      label: "Join the community",
      description: joinedCommunity
        ? "You're in the GCODE WhatsApp group for this event"
        : "GCODE WhatsApp group for this event",
      action: joinedCommunity ? "Joined" : "Join",
      icon: MessageCircle,
      onAction: () => setJoinedCommunity(true),
      done: joinedCommunity,
    },
  ];

  return (
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
            <EventBadgeRow
              type={event.type}
              mode={event.mode}
              price={event.price}
            />
            <ButtonLink href={`/events/${event.id}`} variant="ghost" size="sm">
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
        <SectionLabel>Your Ticket</SectionLabel>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <QrPlaceholder />
          <div className="space-y-2">
            <p className="text-small text-text-secondary">Booking Reference</p>
            <BookingRef>{bookingRef}</BookingRef>
            <p className="text-small text-text-secondary">
              Present this at the event check-in or share your QR code.
            </p>
            <Button variant="primary" size="sm" onClick={downloadTicket}>
              Download Ticket
            </Button>
          </div>
        </div>
      </div>

      <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-6">
        <SectionLabel>What&apos;s Next</SectionLabel>
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
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={step.done && step.label === "Join the community"}
                  onClick={step.onAction}
                >
                  {step.action}
                </Button>
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
  );
}

"use client";

import { CalendarPlus } from "lucide-react";
import { ButtonLink } from "@/components/atoms";
import { EmptyState, EventCard } from "@/components/molecules";
import { AuthenticatedShell } from "@/app/_components/authenticated-shell";
import { eventTypeTone } from "@/lib/mock-events";
import { getOrganizedEvents } from "@/lib/organized-events";

export default function MyOrganizedEventsPage() {
  const events = getOrganizedEvents();

  return (
    <AuthenticatedShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-display text-text-primary font-extrabold">
              Organizing
            </h1>
            <p className="text-body text-text-secondary">
              Events you&apos;re hosting on GCODE.
            </p>
          </div>
          <ButtonLink
            href="/my-organized-events/new"
            variant="primary"
            className="shrink-0"
          >
            + Host Event
          </ButtonLink>
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="You haven't hosted an event yet"
            description="Set up your first event in a few guided steps — you can also request help from the community along the way."
            action={
              <ButtonLink href="/my-organized-events/new" variant="primary">
                + Host Event
              </ButtonLink>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                variant="compact"
                href={`/my-organized-events/${event.id}`}
                tags={
                  event.status === "cancelled"
                    ? [{ label: "Cancelled", tone: "danger" }]
                    : [
                        { label: event.type, tone: eventTypeTone[event.type] },
                        {
                          label: event.price,
                          tone: event.price === "Free" ? "success" : "neutral",
                        },
                      ]
                }
                title={event.title}
                date={event.date}
                actionLabel="Manage"
              />
            ))}
          </div>
        )}
      </div>
    </AuthenticatedShell>
  );
}

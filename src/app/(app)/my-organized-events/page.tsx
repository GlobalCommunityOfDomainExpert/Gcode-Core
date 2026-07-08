"use client";

import { CalendarPlus } from "lucide-react";
import { ButtonLink } from "@/components/atoms";
import { EmptyState, EventCard } from "@/components/molecules";
import { eventTypeTone, priceTone } from "@/lib/event";
import { useEvents } from "@/hooks/use-events";

export default function MyOrganizedEventsPage() {
  const { events, status } = useEvents();

  return (
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

      {status === "loading" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-border-light bg-surface-light h-40 animate-pulse rounded-md border"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
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
              imageSrc={event.coverImageUrl}
              colorSeed={event.id}
              tags={
                event.status === "CANCELLED"
                  ? [{ label: "Cancelled", tone: "danger" }]
                  : [
                      { label: event.type, tone: eventTypeTone(event.type) },
                      {
                        label: event.price,
                        tone: priceTone(event.price),
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
  );
}

"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/atoms";
import { Carousel, Chip, EventCard, Tabs } from "@/components/molecules";
import { AuthenticatedShell } from "@/app/_components/authenticated-shell";
import { eventTypeTone, mockEvents } from "@/lib/mock-events";

const categoryTabs = [
  { value: "all", label: "All" },
  { value: "Webinar", label: "Webinars" },
  { value: "Hackathon", label: "Hackathons" },
  { value: "Ideathon", label: "Ideathons" },
  { value: "Community Meetup", label: "Meetups" },
  { value: "Expert AMA", label: "Expert AMAs" },
];

const filterChips = ["Free", "Paid", "Online", "In-Person"] as const;

const placeholderAttendees = [
  { alt: "Attendee", initials: "A" },
  { alt: "Attendee", initials: "B" },
  { alt: "Attendee", initials: "C" },
];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  function toggleFilter(filter: string) {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  }

  const featured = mockEvents.filter((event) => event.featured);

  const filtered = mockEvents.filter((event) => {
    if (activeTab !== "all" && event.type !== activeTab) return false;
    if (activeFilters.includes("Free") && event.price !== "Free") return false;
    if (activeFilters.includes("Paid") && event.price === "Free") return false;
    if (activeFilters.includes("Online") && event.mode !== "Online")
      return false;
    if (activeFilters.includes("In-Person") && event.mode !== "In-Person")
      return false;
    return true;
  });

  return (
    <AuthenticatedShell>
      <div className="space-y-8">
        <div className="bg-primary flex flex-col gap-4 rounded-md p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-display font-extrabold text-white">
              Discover Events &amp; Webinars
            </h1>
            <p className="text-body mt-1 text-white/70">
              Hackathons, Ideathons, Expert AMAs, Live Webinars — all in one
              place.
            </p>
          </div>
          <ButtonLink
            href="/my-organized-events/new"
            variant="secondary"
            className="shrink-0"
          >
            + Host / Submit Event
          </ButtonLink>
        </div>

        <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-4">
          <Tabs
            items={categoryTabs}
            value={activeTab}
            onChange={setActiveTab}
          />
          <div className="flex flex-wrap gap-2">
            {filterChips.map((filter) => (
              <Chip
                key={filter}
                selected={activeFilters.includes(filter)}
                onClick={() => toggleFilter(filter)}
              >
                {filter}
              </Chip>
            ))}
          </div>
        </div>

        {featured.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-small text-text-secondary font-bold tracking-widest uppercase">
              Featured
            </h2>
            <Carousel>
              {featured.map((event) => (
                <EventCard
                  key={event.id}
                  variant="featured"
                  headerLabel={event.type}
                  href={`/events/${event.id}`}
                  tags={[
                    { label: event.mode },
                    {
                      label: event.price,
                      tone: event.price === "Free" ? "success" : "neutral",
                    },
                  ]}
                  title={event.title}
                  date={`${event.date} · ${event.time}`}
                  location={
                    event.mode === "In-Person" ? event.location : undefined
                  }
                  attendees={placeholderAttendees}
                  attendeesLabel={
                    event.registeredCount
                      ? `+${event.registeredCount} registered`
                      : event.interestedCount
                        ? `+${event.interestedCount} interested`
                        : undefined
                  }
                  urgencyLabel={
                    event.spotsLeft
                      ? `${event.spotsLeft} spots left`
                      : undefined
                  }
                />
              ))}
            </Carousel>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-small text-text-secondary font-bold tracking-widest uppercase">
            Upcoming Events
          </h2>
          {filtered.length === 0 ? (
            <p className="border-border-light bg-surface-light text-body text-text-secondary rounded-md border p-8 text-center">
              No events match these filters.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event) => (
                <EventCard
                  key={event.id}
                  variant="compact"
                  href={`/events/${event.id}`}
                  tags={[
                    { label: event.type, tone: eventTypeTone[event.type] },
                    {
                      label: event.price,
                      tone: event.price === "Free" ? "success" : "neutral",
                    },
                  ]}
                  title={event.title}
                  date={event.date}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AuthenticatedShell>
  );
}

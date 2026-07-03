"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ButtonLink, Icon } from "@/components/atoms";
import {
  Carousel,
  CarouselHandle,
  CarouselState,
  Chip,
  EventCard,
  Tabs,
} from "@/components/molecules";
import { getAttendeesByEvent } from "@/lib/attendees";
import { eventTypeTone, mockEvents } from "@/lib/mock-events";
import { useEventsFiltersStore } from "@/store/events-filters-store";

const categoryTabs = [
  { value: "all", label: "All" },
  { value: "Webinar", label: "Webinars" },
  { value: "Hackathon", label: "Hackathons" },
  { value: "Ideathon", label: "Ideathons" },
  { value: "Community Meetup", label: "Meetups" },
  { value: "Expert AMA", label: "Expert AMAs" },
];

const filterChips = ["Free", "Paid", "Online", "In-Person"] as const;

export default function EventsPage() {
  const activeTab = useEventsFiltersStore((state) => state.activeTab);
  const activeFilters = useEventsFiltersStore((state) => state.activeFilters);
  const setActiveTab = useEventsFiltersStore((state) => state.setActiveTab);
  const toggleFilter = useEventsFiltersStore((state) => state.toggleFilter);
  const featuredCarouselRef = useRef<CarouselHandle>(null);
  const [featuredCarouselState, setFeaturedCarouselState] =
    useState<CarouselState>({ canScrollPrev: false, canScrollNext: false });

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
    <div className="space-y-8">
      <div className="bg-primary flex flex-col gap-4 rounded-md p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-display font-bold text-white">
            Discover Events &amp; Webinars
          </h4>
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
        <Tabs items={categoryTabs} value={activeTab} onChange={setActiveTab} />
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
          <div className="flex items-center justify-between">
            <h2 className="text-small text-text-secondary font-bold tracking-widest uppercase">
              Featured
            </h2>
            {(featuredCarouselState.canScrollPrev ||
              featuredCarouselState.canScrollNext) && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => featuredCarouselRef.current?.scrollPrev()}
                  aria-label="Previous"
                  disabled={!featuredCarouselState.canScrollPrev}
                  className="border-border-light bg-surface-light text-text-secondary hover:text-text-primary focus-visible:ring-primary flex size-8 items-center justify-center rounded-full border shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40"
                >
                  <Icon icon={ChevronLeft} size="sm" />
                </button>
                <button
                  type="button"
                  onClick={() => featuredCarouselRef.current?.scrollNext()}
                  aria-label="Next"
                  disabled={!featuredCarouselState.canScrollNext}
                  className="border-border-light bg-surface-light text-text-secondary hover:text-text-primary focus-visible:ring-primary flex size-8 items-center justify-center rounded-full border shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40"
                >
                  <Icon icon={ChevronRight} size="sm" />
                </button>
              </div>
            )}
          </div>
          <Carousel
            ref={featuredCarouselRef}
            hideArrows
            onStateChange={setFeaturedCarouselState}
          >
            {featured.map((event) => {
              const attendees = getAttendeesByEvent(event.id)
                .slice(0, 3)
                .map((attendee) => ({
                  alt: attendee.name,
                  initials: attendee.avatarInitials,
                }));
              return (
                <EventCard
                  key={event.id}
                  variant="featured"
                  headerLabel={event.type}
                  href={`/events/${event.id}`}
                  imageSrc={event.coverImageUrl}
                  colorSeed={event.id}
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
                  attendees={attendees}
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
              );
            })}
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
                imageSrc={event.coverImageUrl}
                colorSeed={event.id}
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
  );
}

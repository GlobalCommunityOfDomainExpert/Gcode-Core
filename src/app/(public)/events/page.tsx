"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  CalendarX,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Gift,
  Globe,
  LayoutGrid,
  MapPin,
  SearchX,
} from "lucide-react";
import { Button, Icon } from "@/components/atoms";
import {
  Carousel,
  CarouselHandle,
  CarouselState,
  Chip,
  EmptyState,
  EventCard,
  EventCardSkeleton,
  SearchBar,
  Tabs,
} from "@/components/molecules";
import { eventTypeTone, priceTone } from "@/lib/event";
import { useEvents } from "@/hooks/use-events";
import { useLookup } from "@/hooks/use-lookup";
import { getEventTypes } from "@/lib/api/lookups";

const filterChips = [
  { value: "All", label: "All", icon: LayoutGrid },
  { value: "Free", label: "Free", icon: Gift },
  { value: "Paid", label: "Paid", icon: CreditCard },
  { value: "Online", label: "Online", icon: Globe },
  { value: "In-Person", label: "In-Person", icon: MapPin },
] as const;

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const featuredCarouselRef = useRef<CarouselHandle>(null);
  const [featuredCarouselState, setFeaturedCarouselState] =
    useState<CarouselState>({ canScrollPrev: false, canScrollNext: false });
  const { events, status } = useEvents();
  const { data: eventTypes } = useLookup(getEventTypes);

  const categoryTabs = [
    { value: "all", label: "All" },
    ...eventTypes.map((type) => ({ value: type.name, label: type.name })),
  ];

  function toggleFilter(filter: string) {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  }

  // Drafts aren't public yet — organizers still see them under
  // /my-organized-events.
  const visibleEvents = events.filter((event) => event.status !== "DRAFT");

  function matchesFilters(event: (typeof visibleEvents)[number]) {
    if (activeTab !== "all" && event.type !== activeTab) return false;

    // Chips within the same facet (price: Free/Paid, mode: Online/In-Person)
    // are OR'd together — selecting both Free and Paid should show either,
    // not neither (the previous AND-everything logic made that combination
    // impossible to satisfy). Different facets still AND together.
    const priceFilters = activeFilters.filter(
      (f) => f === "Free" || f === "Paid",
    );
    if (
      priceFilters.length > 0 &&
      !priceFilters.some((f) =>
        f === "Free" ? event.price === "Free" : event.price !== "Free",
      )
    )
      return false;

    const modeFilters = activeFilters.filter(
      (f) => f === "Online" || f === "In-Person",
    );
    if (modeFilters.length > 0 && !modeFilters.some((f) => f === event.mode))
      return false;

    if (
      search.trim() &&
      !event.title.toLowerCase().includes(search.trim().toLowerCase())
    )
      return false;
    return true;
  }

  const featured = visibleEvents
    .filter((event) => event.is_featured)
    .filter(matchesFilters);

  const filtered = visibleEvents.filter(matchesFilters);

  const hasActiveFilters =
    activeTab !== "all" || activeFilters.length > 0 || search.trim() !== "";

  function clearAllFilters() {
    setActiveTab("all");
    setActiveFilters([]);
    setSearch("");
  }

  return (
    <div className="space-y-8 flex flex-col gap-3">
      <div className="bg-primary relative flex min-h-[126px] gap-4 overflow-hidden rounded-md p-6 py-8 sm:min-h-[162px] sm:flex-row sm:justify-between">
        <Image
          src="/events-hero.png"
          alt=""
          width={800}
          height={150}
          className="absolute top-1/2 right-0 hidden w-[378px] -translate-y-1/2 sm:block lg:w-[720px]"
          priority
        />
        <div className="from-primary via-primary/90 to-primary/40 absolute inset-0 bg-gradient-to-r" />

        <div className="relative flex flex-col gap-6">
          <div>
            <h4 className="text-display font-bold text-white">
              Discover Events &amp; Webinars
            </h4>
            <p className="text-body mt-1 text-white/70">
              Hackathons, Ideathons, Expert AMAs, Live Webinars — all in one
              place.
            </p>
          </div>

          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search events..."
            className="mt-4 w-full max-w-sm"
          />
        </div>
      </div>

      <div className="border-border-light bg-surface-light space-y-4 rounded-md border p-4">
        <Tabs items={categoryTabs} value={activeTab} onChange={setActiveTab} />
        <div className="flex flex-wrap gap-2">
          {filterChips.map((chip) => {
            const selected =
              chip.value === "All"
                ? activeFilters.length === 0
                : activeFilters.includes(chip.value);
            return (
              <Chip
                key={chip.value}
                selected={selected}
                onClick={() =>
                  chip.value === "All"
                    ? setActiveFilters([])
                    : toggleFilter(chip.value)
                }
              >
                <span className="inline-flex items-center gap-1.5">
                  <Icon icon={chip.icon} size="sm" />
                  {chip.label}
                </span>
              </Chip>
            );
          })}
        </div>
      </div>

      {featured.length > 0 && (
        <section className="flex flex-col gap-6 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-1 rounded-full bg-blue-500" />
              <div>
                <h2 className="text-text-secondary text-base font-bold tracking-widest uppercase">
                  Featured Events
                </h2>
                <h6 className="text-s text-gray-400">
                  Explore events that intrest you
                </h6>
              </div>
            </div>
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
            itemClassName="w-full shrink-0 snap-start sm:w-[calc(45%-0.5rem)]"
          >
            {featured.map((event) => (
              <EventCard
                key={event.id}
                variant="featured"
                href={`/events/${event.id}`}
                imageSrc={event.coverImageUrl}
                colorSeed={event.id}
                tags={[
                  { label: event.type, tone: eventTypeTone(event.type) },
                  {
                    label: event.price,
                    tone: priceTone(event.price),
                  },
                ]}
                title={event.title}
                date={`${event.date} · ${event.time}`}
                location={
                  event.mode === "In-Person" ? event.location : undefined
                }
                eventType={event.type}
                durationText={event.duration || undefined}
                spotsLeft={event.spotsLeft}
                attendeesLabel={
                  event.registeredCount
                    ? `${event.registeredCount} going`
                    : event.interestedCount
                      ? `${event.interestedCount} interested`
                      : undefined
                }
              />
            ))}
          </Carousel>
        </section>
      )}

      <section className="flex flex-col gap-6 space-y-3">
        <div className="flex items-center gap-4">
          <div className="h-10 w-1 rounded-full bg-red-500" />
          <div>
            <h2 className="text-text-secondary text-base font-bold tracking-widest uppercase">
              Upcoming Events
            </h2>
            <h6 className="text-s text-gray-400">
              Explore events that intrest you
            </h6>
          </div>
        </div>

        {status === "loading" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : status === "error" ? (
          <EmptyState
            icon={CalendarX}
            title="Couldn't load events"
            description="Something went wrong on our end. Refresh the page to try again."
            action={
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No events match these filters"
            description={
              hasActiveFilters
                ? "Try a different category, clear a filter, or search for something else."
                : "There's nothing here yet — check back soon."
            }
            action={
              hasActiveFilters ? (
                <Button variant="secondary" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                variant="default"
                href={`/events/${event.id}`}
                imageSrc={event.coverImageUrl}
                colorSeed={event.id}
                tags={[
                  { label: event.type, tone: "primary" },
                  {
                    label: event.price,
                    tone: priceTone(event.price),
                  },
                ]}
                title={event.title}
                date={event.date}
                location={
                  event.mode === "In-Person" ? event.location : undefined
                }
                eventType={event.type}
                durationText={event.duration || undefined}
                spotsLeft={event.spotsLeft}
                attendeesLabel={
                  event.registeredCount
                    ? `${event.registeredCount} going`
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

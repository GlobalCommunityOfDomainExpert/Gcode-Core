"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  GraduationCap,
  Gift,
  Globe,
  LayoutGrid,
  MapPin,
  Rocket,
  SearchX,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button, Icon } from "@/components/atoms";
import {
  AvatarGroupItem,
  Chip,
  EmptyState,
  EventCard,
  EventCardSkeleton,
  SearchBar,
  Tabs,
} from "@/components/molecules";
import { eventTypeTone, hasEventEnded, priceTone } from "@/lib/event";
import { hashSeed } from "@/lib/event-color";
import { useEvent } from "@/hooks/use-event";
import { useEvents } from "@/hooks/use-events";
import { useLookup } from "@/hooks/use-lookup";
import { useServerNow } from "@/hooks/use-server-now";
import { getEventTypes } from "@/lib/api/lookups";

// No real attendee-identity data exists for the featured spotlight card — this
// pool + a deterministic per-event/index seed gives varied-looking avatars
// without inventing fake names or risking SSR/client hydration mismatches
// (Math.random() during render would differ between server and client).
// Hues are spread by the golden angle (~137.5°) from a per-event base hue so
// every avatar in the same group lands on a visibly distinct color, rather
// than relying on the raw hash (adjacent seeds can hash to similar hues).
const ATTENDEE_INITIALS = ["AK", "MJ", "RS", "PV", "SN", "DK", "TT", "NG"];
const GOLDEN_ANGLE = 137.5;

function buildAttendeeAvatars(
  eventId: string,
  count: number,
): AvatarGroupItem[] {
  const seed = hashSeed(eventId);
  const baseHue = seed % 360;
  const initialsOffset = seed % ATTENDEE_INITIALS.length;
  return Array.from({ length: count }, (_, index) => ({
    alt: "Attendee",
    initials:
      ATTENDEE_INITIALS[(initialsOffset + index) % ATTENDEE_INITIALS.length],
    bgColor: `hsl(${(baseHue + index * GOLDEN_ANGLE) % 360} 55% 42%)`,
  }));
}

const filterChips = [
  { value: "All", label: "All", icon: LayoutGrid },
  { value: "Free", label: "Free", icon: Gift },
  { value: "Paid", label: "Paid", icon: CreditCard },
  { value: "Online", label: "Online", icon: Globe },
  { value: "In-Person", label: "In-Person", icon: MapPin },
] as const;

const whyJoinItems = [
  {
    icon: GraduationCap,
    title: "Learn",
    description: "Gain knowledge from industry experts",
  },
  {
    icon: Users,
    title: "Connect",
    description: "Network with like-minded professionals",
  },
  {
    icon: TrendingUp,
    title: "Grow",
    description: "Upskill and advance your career",
  },
  {
    icon: Rocket,
    title: "Build",
    description: "Work on real challenges and build solutions",
  },
] as const;

const FEATURED_ROTATE_MS = 6000;

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredPaused, setFeaturedPaused] = useState(false);
  const { events, status } = useEvents();
  const { data: eventTypes } = useLookup(getEventTypes);
  const now = useServerNow();

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
    .filter((event) => !hasEventEnded(event, now))
    .filter(matchesFilters);

  useEffect(() => {
    if (featured.length <= 1 || featuredPaused) return;
    const id = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featured.length);
    }, FEATURED_ROTATE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featured.length, featuredPaused]);

  const activeFeaturedIndex =
    featured.length === 0 ? 0 : featuredIndex % featured.length;
  const activeFeaturedEvent = featured[activeFeaturedIndex];

  // The list endpoint never returns a description (only populated on detail
  // fetch) — fetch it for whichever featured event is currently on screen so
  // the spotlight card can show a real one. Guarded against the id so a
  // stale previous-event description can't flash while the new one loads.
  const { event: activeFeaturedDetail } = useEvent(activeFeaturedEvent?.id);
  const featuredDescriptionLines =
    activeFeaturedEvent && activeFeaturedDetail?.id === activeFeaturedEvent.id
      ? activeFeaturedDetail.description
      : [];

  const filtered = visibleEvents.filter(matchesFilters);
  const upcomingFiltered = filtered.filter((e) => !hasEventEnded(e, now));
  const pastFiltered = filtered
    .filter((e) => hasEventEnded(e, now))
    .sort((a, b) => (b.endDateIso ?? "").localeCompare(a.endDateIso ?? ""));

  const hasActiveFilters =
    activeTab !== "all" || activeFilters.length > 0 || search.trim() !== "";

  function clearAllFilters() {
    setActiveTab("all");
    setActiveFilters([]);
    setSearch("");
  }

  return (
    <div className="flex flex-col gap-3 space-y-8">
      <div className="relative flex flex-col">
        <div className="relative left-1/2 flex min-h-100 w-screen -translate-x-1/2 items-center overflow-hidden bg-black lg:min-h-125">
          <Image
            src="/banner-hero.png"
            alt=""
            fill
            className="hidden object-cover sm:block"
            priority
          />
          <div className="absolute inset-0 hidden bg-linear-to-r from-black/80 via-black/40 to-transparent sm:block" />

          <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-24 pb-14 sm:px-6 sm:pt-24 sm:pb-8 lg:px-8">
            <div>
              <h1 className="text-display font-bold text-white">
                Explore. Learn. Connect.
                <br />
                Power Your Growth with
                <br />
                <span className="text-secondary">GCODE</span> Events
              </h1>
              <p className="text-body mt-1 text-white/70">
                Hackathons, Ideathons, Expert AMAs, Live Webinars — all in one
                place.
              </p>
            </div>

            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search events..."
              className="mt-4 w-full"
            />
          </div>
        </div>

        <div className="border-border-light bg-surface-light relative -top-4 space-y-4 rounded-md border p-4 sm:-top-6 lg:-top-10">
          <Tabs
            items={categoryTabs}
            value={activeTab}
            onChange={setActiveTab}
          />
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
      </div>

      {/* <section className="bg-secondary-light overflow-hidden rounded-lg p-6 sm:p-8">
        <h3 className="text-large text-text-primary font-bold">
          Why join GCODE Events?
        </h3>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyJoinItems.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <Icon icon={item.icon} size="lg" className="text-secondary shrink-0" />
              <div>
                <h4 className="text-body text-text-primary font-semibold">
                  {item.title}
                </h4>
                <p className="text-small text-text-secondary">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {featured.length > 0 &&
        activeFeaturedEvent &&
        (() => {
          const event = activeFeaturedEvent;
          return (
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
                {featured.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setFeaturedIndex(
                          (activeFeaturedIndex - 1 + featured.length) %
                            featured.length,
                        )
                      }
                      aria-label="Previous featured event"
                      className="border-border-light bg-surface-light text-text-secondary hover:text-text-primary focus-visible:ring-primary flex size-8 items-center justify-center rounded-full border shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <Icon icon={ChevronLeft} size="sm" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFeaturedIndex(
                          (activeFeaturedIndex + 1) % featured.length,
                        )
                      }
                      aria-label="Next featured event"
                      className="border-border-light bg-surface-light text-text-secondary hover:text-text-primary focus-visible:ring-primary flex size-8 items-center justify-center rounded-full border shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <Icon icon={ChevronRight} size="sm" />
                    </button>
                  </div>
                )}
              </div>

              <div
                onMouseEnter={() => setFeaturedPaused(true)}
                onMouseLeave={() => setFeaturedPaused(false)}
              >
                <EventCard
                  key={event.id}
                  variant="featured"
                  href={`/events/${event.id}`}
                  imageSrc={event.coverImageUrl}
                  colorSeed={event.id}
                  tags={[
                    { label: event.type, tone: eventTypeTone(event.type) },
                    { label: event.mode, tone: "neutral" },
                  ]}
                  price={event.price}
                  priceTone={priceTone(event.price)}
                  title={event.title}
                  date={`${event.date} · ${event.time}`}
                  subtitle={featuredDescriptionLines[0]}
                  attendees={buildAttendeeAvatars(
                    event.id,
                    Math.min(event.registeredCount, 4),
                  )}
                  attendeesLabel={
                    event.registeredCount > 3
                      ? `+${event.registeredCount} registered`
                      : undefined
                  }
                  stats={[
                    {
                      icon: Calendar,
                      primary: event.date,
                      secondary:
                        event.durationText || event.duration || "Event",
                    },
                  ]}
                />

                {featured.length > 1 && (
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    {featured.map((f, index) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFeaturedIndex(index)}
                        aria-label={`Go to featured event ${index + 1}`}
                        aria-current={index === activeFeaturedIndex}
                        className={`size-1.5 rounded-full transition-colors ${
                          index === activeFeaturedIndex
                            ? "bg-primary"
                            : "bg-border-hover"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })()}

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
        ) : upcomingFiltered.length === 0 ? (
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
            {upcomingFiltered.map((event) => (
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

      {pastFiltered.length > 0 && (
        <section className="flex flex-col gap-6 space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1 rounded-full bg-gray-400" />
            <div>
              <h2 className="text-text-secondary text-base font-bold tracking-widest uppercase">
                Past Events
              </h2>
              <h6 className="text-s text-gray-400">
                Events that have already ended
              </h6>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pastFiltered.map((event) => (
              <EventCard
                key={event.id}
                variant="default"
                isPast
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
        </section>
      )}
    </div>
  );
}

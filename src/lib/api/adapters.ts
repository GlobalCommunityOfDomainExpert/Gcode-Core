import { EventType, EventStatus, Event } from "@/lib/event";
import { EventDetail, EventListItem } from "./types";

const MODE_NAME_MAP: Record<string, Event["mode"]> = {
  PHYSICAL: "In-Person",
  ONLINE: "Online",
  HYBRID: "Hybrid",
};

const KNOWN_EVENT_STATUSES: EventStatus[] = [
  "DRAFT",
  "APPROVAL_PENDING",
  "OPEN",
  "REGISTRATION_CLOSED",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];

function resolveEventType(name: string | undefined): EventType {
  return name ?? "Other";
}

function resolveMode(name: string | undefined): Event["mode"] {
  return (name && MODE_NAME_MAP[name]) || "Online";
}

function resolveStatus(code: string | undefined): EventStatus | undefined {
  return KNOWN_EVENT_STATUSES.find((s) => s === code);
}

function formatDate(iso: string | null): string {
  if (!iso) return "TBD";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  return `${new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(iso))} UTC`;
}

function resolveLocation(city: string, address: string | null): string {
  if (address && address !== "TBD") return `${address}, ${city}`;
  return city;
}

// Maps a GCODE_Events_API event onto the UI's Event shape — see event.ts
// for which fields are backed by real columns vs. hardcoded placeholders.
export function adaptApiEvent(
  event: EventListItem | EventDetail,
  eventTypeNames: Record<number, string>,
  modeNames: Record<number, string>,
  statusCodes: Record<number, string>,
): Event {
  const detail = "description" in event ? event : undefined;
  const price = event.ticket_price === 0 ? "Free" : `₹${event.ticket_price}`;

  return {
    id: String(event.id),
    title: event.event_name,
    type: resolveEventType(eventTypeNames[event.event_type_id]),
    mode: resolveMode(modeNames[event.mode_of_event_id]),
    status: resolveStatus(statusCodes[event.status_id]),
    price,
    priceAmount: event.ticket_price || undefined,
    date: formatDate(event.start_date),
    time: formatTime(event.start_date),
    location: resolveLocation(event.city, event.address),
    registeredCount: 0,
    capacity: event.max_attendees ?? undefined,
    spotsLeft: undefined,
    featured: event.is_featured === 1,
    registrationCloses: detail?.registration_deadline
      ? formatDate(detail.registration_deadline)
      : formatDate(event.start_date),
    duration: "",
    teamSize: "",
    certificate: false,
    description: detail?.description ? [detail.description] : [],
    agenda: [],
    organizer: {
      name: detail?.created_by || "GCODE Team",
      title: "Organizer",
      verified: false,
      eventsHosted: 0,
      attendees: 0,
    },
    terms: [],
    tags: detail?.categories?.map((c) => c.category_name),
    coverImageUrl: event.cover_image_url ?? undefined,
    mediaUrls: event.banner_image_url ? [event.banner_image_url] : [],
    participationLink: event.participation_link ?? undefined,
  };
}

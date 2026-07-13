import { EventType, EventStatus, Event, EventTimelineItem, MyTicket } from "@/lib/event";
import { EventDetailData } from "@/lib/zod/event";
import { EventTimelineApi } from "./events";
import { Attendee, AttendeeRole } from "@/lib/attendees";
import {
  EventDetail,
  EventListItem,
  CreateEventPayload,
  ParticipantApi,
  MyParticipationApi,
} from "./types";
import { API_BASE_URL } from "./client";

// Cover/banner URLs may be stored as an API-relative path (DB-hosted image) or
// an absolute URL. Resolve relative ones against the API base.
function resolveImageUrl(url: string | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}

// Shown when an organizer hasn't set custom terms/eligibility for an event.
export const DEFAULT_TERMS = [
  "Registration confirms your agreement to attend and follow the event's code of conduct.",
  "GCODE reserves the right to modify event details or cancel the event due to unforeseen circumstances.",
  "No refunds for paid tickets unless the event is cancelled by the organizer.",
];

export const DEFAULT_ELIGIBILITY = [
  "Open to all professionals, students, and enthusiasts interested in the topic.",
  "Participants must be 18 years or older, or attend with a guardian.",
];

// Organizer text is stored newline-separated (like DESCRIPTION); split into
// bullet lines, falling back to the defaults above when blank/unset.
function splitBullets(raw: string | null, fallback: string[]): string[] {
  if (!raw) return fallback;
  const lines = raw.split("\n").filter((line) => line.trim() !== "");
  return lines.length > 0 ? lines : fallback;
}

// EVENT_TIMELINE row -> UI timeline item. Splits the ISO start/end into the
// date + time fields the UI uses.
export function adaptTimelineItem(row: EventTimelineApi): EventTimelineItem {
  return {
    date: row.start_time ? istDate(row.start_time) : "",
    time: row.start_time ? istTime(row.start_time) : "",
    endTime: row.end_time ? istTime(row.end_time) : undefined,
    title: row.title,
    description: row.description ?? "",
    location: row.location ?? undefined,
  };
}

const ROLE_NAME_MAP: Record<string, AttendeeRole> = {
  FRESHER: "Fresher",
  STARTUP: "Startup Founder",
  EXPERT: "Domain Expert",
  INSTITUTION: "Institution",
};

// "Jane Doe" -> "JD". Guest registrants only ever give a full name, no
// avatar image, so initials are all we can show.
function initialsOf(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

// GCODE_EVENT_PARTICIPANTS row -> UI Attendee. Status collapses to
// "registered" for now — the participants table has no attended/no-show
// tracking yet. ticketType/amountPaid come from the event's single price
// (no per-attendee ticket tiers exist).
export function adaptParticipant(
  row: ParticipantApi,
  eventTicketPrice: number,
): Attendee {
  return {
    id: String(row.id),
    eventId: String(row.event_id),
    name: row.user_name,
    email: row.email ?? "",
    avatarInitials: initialsOf(row.user_name),
    role: (row.role_name && ROLE_NAME_MAP[row.role_name]) || "Guest",
    ticketType: eventTicketPrice > 0 ? "Paid" : "Free",
    quantity: row.quantity,
    amountPaid:
      eventTicketPrice > 0 ? eventTicketPrice * row.quantity : undefined,
    status: "registered",
    registeredAt: row.applied_on,
  };
}

// Combine the wizard's separate date ("2026-08-01") + time ("14:30") inputs
// into one ISO timestamp for the DB. Missing time -> midnight.
// Wall-clock date+time typed by the user is IST -> stamp with +05:30 so the
// stored instant is correct.
function toIsoTimestamp(date: string, time?: string): string | undefined {
  if (!date) return undefined;
  return `${date}T${time && time !== "" ? time : "00:00"}:00+05:30`;
}

// Maps the wizard's EventDetailData onto the ORDS create payload. Only fields
// with a real backing column are sent; timeline/cover-upload handled separately.
export function toCreatePayload(
  data: EventDetailData,
  createdBy?: string,
  organizerId?: number,
): CreateEventPayload {
  if (data.type === null) {
    throw new Error("Event type is required before creating an event");
  }
  return {
    title: data.title,
    event_type_id: data.type,
    mode_of_event_id: data.mode,
    description: data.description || undefined,
    start_date: toIsoTimestamp(data.date, data.time),
    registration_deadline: data.registrationCloses
      ? toIsoTimestamp(data.registrationCloses)
      : undefined,
    city: data.city || undefined,
    venue_address: data.location || undefined,
    participation_link: data.participationLink || undefined,
    max_attendees: data.capacity || undefined,
    ticket_price: data.priceAmount,
    certificate_offered: data.certificate ? 1 : 0,
    created_by: createdBy,
    organizer_id: organizerId,
    max_tickets_per_registration: data.maxTicketsPerRegistration || undefined,
    terms: data.terms.trim() || undefined,
    eligibility: data.eligibility.trim() || undefined,
    duration_text: data.duration.trim() || undefined,
  };
}

// JSON_ARRAYAGG columns arrive as a JSON-array-shaped string (or null when
// the event has no categories) rather than a real array.
function parseJsonArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

// Raw event detail + timeline -> wizard EventDetailData (with FK ids intact),
// for prefilling the edit wizard.
export function toEventDraft(
  detail: EventDetail,
  timeline: EventTimelineApi[] = [],
): EventDetailData {
  return {
    id: detail.id,
    type: detail.event_type_id,
    title: detail.event_name,
    description: detail.description ?? "",
    priceAmount: detail.ticket_price ?? 0,
    capacity: detail.max_attendees ?? 0,
    maxTicketsPerRegistration: detail.max_tickets_per_registration ?? 0,
    categoryIds: parseJsonArray<number>(detail.category_ids),
    terms: detail.terms ?? "",
    eligibility: detail.eligibility ?? "",
    mode: detail.mode_of_event_id,
    date: detail.start_date ? istDate(detail.start_date) : "",
    time: detail.start_date ? istTime(detail.start_date) : "",
    location: detail.address ?? "",
    city: detail.city ?? "",
    participationLink: detail.participation_link ?? "",
    registrationCloses: detail.registration_deadline
      ? istDate(detail.registration_deadline)
      : "",
    duration: detail.duration_text ?? "",
    coverImageUrl: resolveImageUrl(detail.cover_image_url) ?? "",
    mediaUrls: detail.banner_image_url ? [detail.banner_image_url] : [],
    socialLinks: [],
    timeline: timeline.map((row) => {
      const item = adaptTimelineItem(row);
      return {
        date: item.date,
        time: item.time,
        endTime: item.endTime ?? "",
        title: item.title,
        description: item.description,
        location: item.location ?? "",
      };
    }),
    certificate: detail.certificate_offered === 1,
  };
}

export interface TimelinePayloadItem {
  title: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  sortOrder: number;
}

// Wizard timeline items -> EVENT_TIMELINE rows. Each item's own date + time
// become an ISO timestamp. No date on the item itself -> real NULL (not a
// placeholder, and NOT the event's own date either — an item with times
// hidden must stay genuinely timeless even though the event has a date).
export function toTimelinePayload(
  data: EventDetailData,
): TimelinePayloadItem[] {
  return data.timeline
    .filter((item) => item.title.trim() !== "")
    .map((item, index) => {
      const day = item.date || null;
      return {
        title: item.title,
        description: item.description,
        startTime: day ? (toIsoTimestamp(day, item.time) ?? null) : null,
        endTime: item.endTime && day ? (toIsoTimestamp(day, item.endTime) ?? null) : null,
        location: item.location || null,
        sortOrder: index,
      };
    });
}

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

// All event times are IST (Asia/Kolkata). Wall-clock input is interpreted as
// IST; display + prefill convert back to IST.
const IST = "Asia/Kolkata";

// ISO date "yyyy-mm-dd" of an instant, in IST.
function istDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

// 24h "HH:MM" of an instant, in IST.
function istTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function formatDate(iso: string | null): string {
  if (!iso) return "Coming Soon";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: IST,
  }).format(new Date(iso));
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  return `${new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: IST,
  }).format(new Date(iso))} IST`;
}

function resolveLocation(city: string, address: string | null): string {
  if (address && address !== "TBD") return `${address}, ${city}`;
  return city;
}

// Human duration between two ISO timestamps, e.g. "3h 30m", "2 days".
export function formatDuration(
  start: string | null,
  end: string | null,
): string {
  if (!start || !end) return "";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return "";
  const mins = Math.round(ms / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const rem = mins % 60;
  if (days > 0)
    return `${days} day${days > 1 ? "s" : ""}${hours ? ` ${hours}h` : ""}`;
  if (hours > 0) return `${hours}h${rem ? ` ${rem}m` : ""}`;
  return `${rem}m`;
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
    registeredCount: event.registered_count,
    capacity: event.max_attendees ?? undefined,
    spotsLeft:
      event.max_attendees != null
        ? Math.max(event.max_attendees - event.registered_count, 0)
        : undefined,
    maxTicketsPerRegistration: detail?.max_tickets_per_registration ?? undefined,
    featured: event.is_featured === 1,
    registrationCloses: detail?.registration_deadline
      ? formatDate(detail.registration_deadline)
      : formatDate(event.start_date),
    registrationDeadlineIso: detail?.registration_deadline ?? null,
    duration: formatDuration(event.start_date, event.end_date),
    durationText: detail?.duration_text ?? undefined,
    // No team-size columns yet — default to individual attendance.
    teamSize: "Individual",
    certificate: false,
    description: detail?.description
      ? detail.description.split("\n").filter((line) => line.trim() !== "")
      : [],
    timeline: [],
    organizer: {
      name: detail?.organizer_name || detail?.created_by || "GCODE Team",
      title: "Organizer",
      verified: false,
      eventsHosted: 0,
      attendees: 0,
    },
    terms: splitBullets(detail?.terms ?? null, DEFAULT_TERMS),
    eligibility: splitBullets(detail?.eligibility ?? null, DEFAULT_ELIGIBILITY),
    tags: detail?.category_names
      ? parseJsonArray<string>(detail.category_names)
      : undefined,
    coverImageUrl: resolveImageUrl(event.cover_image_url),
    mediaUrls: event.banner_image_url ? [event.banner_image_url] : [],
    participationLink: event.participation_link ?? undefined,
  };
}

// Maps a GCODE_EVENT_PARTICIPANTS_API.list_by_user row (the signed-in user's
// own registration, joined to its event) onto the UI's MyTicket shape.
export function adaptMyParticipation(
  row: MyParticipationApi,
  eventTypeNames: Record<number, string>,
  modeNames: Record<number, string>,
  statusCodes: Record<number, string>,
): MyTicket {
  return {
    participantId: String(row.participant_id),
    eventId: String(row.event_id),
    title: row.event_name,
    type: resolveEventType(eventTypeNames[row.event_type_id]),
    mode: resolveMode(modeNames[row.mode_of_event_id]),
    status: resolveStatus(statusCodes[row.status_id]),
    date: formatDate(row.start_date),
    time: formatTime(row.start_date),
    location: resolveLocation(row.city, row.address),
    coverImageUrl: resolveImageUrl(row.cover_image_url),
    price: row.ticket_price === 0 ? "Free" : `₹${row.ticket_price}`,
    quantity: row.quantity,
    amountPaid:
      row.ticket_price > 0 ? row.ticket_price * row.quantity : undefined,
    appliedOn: row.applied_on,
  };
}

// Event type names come from the backend's EventTypeLookup table, not a
// fixed set — so this is a plain string, not a literal union.
export type EventType = string;

type Tone = "primary" | "success" | "warning" | "danger" | "neutral";

// Styling only known for these names; anything else falls back to neutral.
const KNOWN_EVENT_TYPE_TONE: Record<string, Tone> = {
  Hackathon: "primary",
  "Expert AMA": "warning",
  Webinar: "success",
  Ideathon: "danger",
  "Community Meetup": "neutral",
  Fest: "primary",
  "Charity Event": "success",
};

const KNOWN_EVENT_TYPE_BORDER_CLASS: Record<string, string> = {
  Hackathon: "border-l-primary",
  "Expert AMA": "border-l-warning",
  Webinar: "border-l-success",
  Ideathon: "border-l-danger",
  "Community Meetup": "border-l-border-hover",
  Fest: "border-l-primary",
  "Charity Event": "border-l-success",
};

export function eventTypeTone(type: EventType): Tone {
  return KNOWN_EVENT_TYPE_TONE[type] ?? "neutral";
}

export function eventTypeBorderClass(type: EventType): string {
  return KNOWN_EVENT_TYPE_BORDER_CLASS[type] ?? "border-l-border-hover";
}

export function priceTone(price: string): Tone {
  return price === "Free" ? "success" : "neutral";
}

export function formatDateBadge(date: string): { day: string; month: string } {
  const [day, month] = date.split(" ");
  return { day, month: month.toUpperCase() };
}

// Backed by EVENT_TIMELINE table.
export interface EventTimelineItem {
  date: string; // yyyy-mm-dd
  time: string;
  endTime?: string;
  title: string;
  description: string;
  location?: string;
}

// No backend table for social links yet — adapter never sets this.
export interface EventSocialLink {
  platform: string;
  url: string;
}

// Backed by EVENT_STATUS lookup table — fixed lifecycle, not open-ended.
export type EventStatus =
  | "DRAFT"
  | "APPROVAL_PENDING"
  | "OPEN"
  | "REGISTRATION_CLOSED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

// One of the signed-in user's own registrations, joined to its event —
// backed by GCODE_EVENT_PARTICIPANTS_API.list_by_user.
export interface MyTicket {
  participantId: string;
  eventId: string;
  title: string;
  type: EventType;
  mode: "Online" | "In-Person" | "Hybrid";
  status?: EventStatus;
  date: string;
  time: string;
  location: string;
  coverImageUrl?: string;
  price: "Free" | string;
  quantity: number;
  amountPaid?: number;
  appliedOn: string;
}

export interface EventOrganizer {
  name: string; // backed by EventDetail.created_by; falls back to "GCODE Team"
  title: string; // no backend column — adapter hardcodes "Organizer"
  verified: boolean; // no backend column — adapter hardcodes false
  eventsHosted: number; // no backend column — adapter hardcodes 0
  attendees: number; // no backend column — adapter hardcodes 0
}

export interface Event {
  id: string; // EventListItem.id
  title: string; // EventListItem.event_name
  type: EventType; // EventListItem.event_type_id, resolved via EventTypeLookup
  mode: "Online" | "In-Person" | "Hybrid"; // EventListItem.mode_of_event_id, resolved via EventModeLookup
  status?: EventStatus; // EventListItem.status_id, resolved via EVENT_STATUS lookup
  price: "Free" | string; // derived from EventListItem.ticket_price
  priceAmount?: number; // EventListItem.ticket_price
  date: string; // derived from EventListItem.start_date
  time: string; // derived from EventListItem.start_date
  location: string; // derived from EventListItem.city + address
  registeredCount: number; // EventListItem.registered_count — live SUM(quantity) from GCODE_EVENT_PARTICIPANTS
  interestedCount?: number; // no backend column — never set
  spotsLeft?: number; // max_attendees - registeredCount
  capacity?: number; // EventListItem.max_attendees
  maxTicketsPerRegistration?: number; // EventDetail.max_tickets_per_registration — organizer cap per single booking, unset = no cap
  featured?: boolean; // EventListItem.is_featured
  registrationCloses: string; // EventDetail.registration_deadline, falls back to start_date
  registrationDeadlineIso?: string | null; // EventDetail.registration_deadline, raw ISO for computing "days left"
  duration: string; // derived from start_date/end_date span, or the timeline's own span as fallback
  durationText?: string; // EventDetail.duration_text — organizer's free-text duration (e.g. "3 hours"), used as a display fallback when time is TBD
  teamSize: string; // no backend column — adapter hardcodes ""
  certificate: boolean; // no backend column — adapter hardcodes false
  description: string[]; // EventDetail.description (detail fetch only), wrapped in array
  timeline: EventTimelineItem[]; // EVENT_TIMELINE rows — adapter hardcodes [] for now
  organizer: EventOrganizer; // see EventOrganizer — only .name is backed
  terms: string[]; // EventDetail.terms, split on newline — falls back to DEFAULT_TERMS when blank
  eligibility: string[]; // EventDetail.eligibility, split on newline — falls back to DEFAULT_ELIGIBILITY when blank
  tags?: string[]; // EventDetail.categories (detail fetch only)
  socialLinks?: EventSocialLink[]; // no backend column — adapter never sets this
  coverImageUrl?: string; // EventListItem.cover_image_url
  mediaUrls?: string[]; // EventListItem.banner_image_url, wrapped in array
  participationLink?: string; // EventListItem.participation_link — column exists, not yet mapped in adapter
}

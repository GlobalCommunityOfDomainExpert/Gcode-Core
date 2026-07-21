export interface EventListItem {
  id: number;
  event_type_id: number;
  event_name: string;

  mode_of_event_id: number;
  max_attendees: number | null;

  city: string;
  address: string | null;

  status_id: number;
  start_date: string | null;
  end_date: string | null;

  ticket_price: number;
  is_featured: number;
  cover_image_url: string | null;
  banner_image_url: string | null;
  participation_link: string | null;
  registered_count: number;
}

export interface EventDetail extends EventListItem {
  registration_start: string | null;
  registration_deadline: string | null;
  participant_registration_start: string | null;
  participant_registration_deadline: string | null;
  description: string | null;
  summary: string | null;
  certificate_offered: number;
  created_by: string | null;
  created_on: string;
  updated_by: string | null;
  updated_on: string | null;
  organizer_id: number | null;
  organizer_name: string | null;
  organizer_email: string | null;
  max_tickets_per_registration: number | null;
  participant_max_tickets_per_registration: number | null;
  // JSON-array-as-string from JSON_ARRAYAGG, e.g. "[1,2]" — parse before use.
  category_ids: string | null;
  category_names: string | null;
  terms: string | null;
  eligibility: string | null;
  duration_text: string | null;
  // Second registration category ("Participant" — people who perform an
  // activity in the event, e.g. hackathon builders), independent price +
  // capacity from the Attendee columns above. Not yet backed by the live
  // backend — contract only, backend implementation is separate work.
  // Both categories are independently toggleable — organizer can flip
  // either on/off any time (wizard, or the organizer's live event page),
  // including after the event's registration_deadline has passed. Missing
  // on a backend that hasn't added the column yet -> treated as enabled
  // (matches today's implicit always-on behavior).
  attendee_registration_enabled: number;
  participant_registration_enabled: number;
  participant_price: number | null;
  participant_capacity: number | null;
  participant_registered_count: number;
  // Organizer-facing display text for each category's pass-selection card.
  // Null/blank -> UI falls back to "Attendee"/"Participant" + no description.
  attendee_label: string | null;
  attendee_description: string | null;
  participant_label: string | null;
  participant_description: string | null;
  // Contract-only — EVENTS has no RATING_MODE column yet as of 2026-07-21.
  // Missing/undefined -> "COMPETITIVE", matching the degrade convention
  // above for attendee_registration_enabled etc.
  rating_mode?: "COMPETITIVE" | "CASUAL";
}

export interface ApiListResponse<T> {
  items: T[];
  hasMore: boolean;
  limit: number;
  offset: number;
  count: number;
}

export interface EventTypeLookup {
  id: number;
  name: string;
  description: string;
}

export interface ApiStatus {
  id: number;
  status_code: string;
  status_name: string;
  description: string;
}

export interface EventModeLookup {
  id: number;
  mode_name: string;
  description: string;
}

export interface CategoryLookup {
  id: number;
  category_name: string;
  description: string;
}

// Mirrors the ORDS POST /events binds -> GCODE_EVENTS_API.create_event params.
// title/event_type_id/mode_of_event_id required; rest optional (proc defaults them).
export interface CreateEventPayload {
  title: string;
  event_type_id: number;
  mode_of_event_id: number;
  status_id?: number;
  summary?: string;
  description?: string;
  start_date?: string; // ISO 8601
  end_date?: string;
  registration_start?: string;
  registration_deadline?: string;
  participant_registration_start?: string;
  participant_registration_deadline?: string;
  city?: string;
  venue_address?: string;
  participation_link?: string;
  max_attendees?: number;
  ticket_price?: number;
  is_featured?: number;
  certificate_offered?: number;
  cover_image_url?: string;
  banner_image_url?: string;
  is_external?: number;
  external_url?: string;
  created_by?: string;
  organizer_id?: number;
  max_tickets_per_registration?: number;
  participant_max_tickets_per_registration?: number;
  terms?: string;
  eligibility?: string;
  duration_text?: string;
  attendee_registration_enabled?: number;
  participant_registration_enabled?: number;
  participant_price?: number;
  participant_capacity?: number;
  attendee_label?: string;
  attendee_description?: string;
  participant_label?: string;
  participant_description?: string;
  rating_mode?: "COMPETITIVE" | "CASUAL";
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

// Mirrors the ORDS POST /events/:id/participants binds ->
// GCODE_EVENT_PARTICIPANTS_API.create_participant. Always finds-or-creates
// the GCODE_USERS row by email/full_name server-side, signed-in or not —
// both binds are required regardless of the Authorization header.
// email/full_name are only required for a guest (no session) registration —
// the backend finds-or-creates the GCODE_USERS row from them. A signed-in
// user sends user_id instead and skips that lookup entirely; exactly one of
// user_id or (email + full_name) must be present.
export interface CreateParticipantPayload {
  email?: string;
  full_name?: string;
  phone?: string;
  user_id?: number;
  quantity: number;
  // Optional — server defaults to "ATTENDEE" when omitted, so every event
  // that never enables Participant registration sends an unchanged payload.
  category?: "ATTENDEE" | "PARTICIPANT";
}

// Mirrors GCODE_EVENT_PARTICIPANTS_API.list_by_event's refcursor row.
export interface ParticipantApi {
  id: number;
  event_id: number;
  user_id: number | null;
  user_name: string;
  quantity: number;
  status: string | null;
  active: string;
  applied_on: string;
  email: string | null;
  phone: string | null;
  role_name: string | null;
  // Optional — missing/undefined on rows from a backend that hasn't added
  // the column yet; frontend treats that the same as "ATTENDEE".
  category?: "ATTENDEE" | "PARTICIPANT";
  // A link the participant hosts themselves (Google Drive, etc.) rather than
  // a binary upload — avoids adding blob storage for large audio files.
  // Missing/undefined -> "not submitted yet", same degrade convention as
  // `category` above.
  audio_submission_url?: string | null;
  audio_submitted_on?: string | null;
  // Contract-only — GCODE_EVENT_PARTICIPANTS has no AGE_CATEGORY column yet
  // as of 2026-07-21. Captured on the additional-info page alongside the
  // audio submission (Participant-category rows only). Missing/undefined ->
  // "not answered yet", same degrade convention as `category` above.
  age_category?: "YOUNGSTER" | "ADULT" | "SENIOR" | null;
}

// Mirrors ORDS POST /events/:id/razorpay-order binds ->
// GCODE_PAYMENTS_API.create_order. Amount is computed server-side from
// ticket_price * quantity — never trust a client-sent amount. email/full_name
// are stored on the order row so the webhook path (no client request to pull
// them from) can still finalize registration on its own.
// Same email/full_name-vs-user_id rule as CreateParticipantPayload above.
export interface CreateRazorpayOrderPayload {
  email?: string;
  full_name?: string;
  phone?: string;
  user_id?: number;
  quantity: number;
  category?: "ATTENDEE" | "PARTICIPANT";
}

// Mirrors GCODE_PAYMENTS_API.create_order's response. key_id is Razorpay's
// public key (safe client-side) — echoed back so the frontend doesn't need
// its own env var; the key *secret* never leaves the backend.
export interface RazorpayOrderApi {
  order_id: string; // Razorpay order_xxx id
  amount: number; // paise
  currency: string; // "INR"
  key_id: string;
}

// Mirrors ORDS POST /participants/razorpay binds ->
// GCODE_PAYMENTS_API.verify_and_register. No event_id, email, full_name, or
// quantity — the backend already has all of that on the GCODE_PAYMENT_ORDERS
// row keyed by razorpay_order_id. This only carries what the backend needs
// to verify the signature (HMAC-SHA256 of order_id|payment_id using the key
// secret) before it creates the participant row — never trust a
// client-reported "paid" status.
export interface VerifyRazorpayPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Mirrors GCODE_EVENT_PARTICIPANTS_API.list_by_user's refcursor row — the
// signed-in user's own registrations, joined to the event they're for.
export interface MyParticipationApi {
  participant_id: number;
  event_id: number;
  event_name: string;
  event_type_id: number;
  mode_of_event_id: number;
  status_id: number;
  start_date: string | null;
  city: string;
  address: string | null;
  ticket_price: number;
  // Attendee-category price is `ticket_price` above; this is Participant's,
  // needed so adaptMyParticipation can price a Participant-category ticket.
  participant_price: number | null;
  cover_image_url: string | null;
  quantity: number;
  status: string | null;
  active: string;
  applied_on: string;
  category?: "ATTENDEE" | "PARTICIPANT";
}

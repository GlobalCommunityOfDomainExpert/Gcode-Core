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
  registration_deadline: string | null;
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
  // JSON-array-as-string from JSON_ARRAYAGG, e.g. "[1,2]" — parse before use.
  category_ids: string | null;
  category_names: string | null;
  terms: string | null;
  eligibility: string | null;
  duration_text: string | null;
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
  registration_deadline?: string;
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
  terms?: string;
  eligibility?: string;
  duration_text?: string;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

// Mirrors the ORDS POST /events/:id/participants binds ->
// GCODE_EVENT_PARTICIPANTS_API.create_participant. Always finds-or-creates
// the GCODE_USERS row by email/full_name server-side, signed-in or not —
// both binds are required regardless of the Authorization header.
export interface CreateParticipantPayload {
  email: string;
  full_name: string;
  quantity: number;
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
  role_name: string | null;
}

// Mirrors ORDS POST /events/:id/razorpay-order binds ->
// GCODE_PAYMENTS_API.create_order. Amount is computed server-side from
// ticket_price * quantity — never trust a client-sent amount. email/full_name
// are stored on the order row so the webhook path (no client request to pull
// them from) can still finalize registration on its own.
export interface CreateRazorpayOrderPayload {
  email: string;
  full_name: string;
  quantity: number;
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
  cover_image_url: string | null;
  quantity: number;
  status: string | null;
  active: string;
  applied_on: string;
}

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
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

// Mirrors the ORDS POST /events/:id/participants binds ->
// GCODE_EVENT_PARTICIPANTS_API.create_participant. Guest registration:
// finds-or-creates the GCODE_USERS row by email server-side.
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

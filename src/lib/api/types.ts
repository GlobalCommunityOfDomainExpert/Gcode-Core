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
}

export interface EventCategory {
  category_id: number;
  category_name: string;
}

export interface EventDetail extends EventListItem {
  registration_deadline: string | null;
  description: string | null;
  created_by: string | null;
  created_on: string;
  updated_by: string | null;
  updated_on: string | null;
  categories?: EventCategory[];
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

export interface CreateEventPayload {
  event_name: string;
  event_type_id: number;
  mode_of_event_id: number;
  city: string;
  address: string;
  description: string;
  status_id: number;
  max_attendees: number;
  ticket_price: number;
  is_featured: number;
  registration_deadline: string;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

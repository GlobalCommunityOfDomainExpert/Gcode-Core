import { apiRequest } from "./client";
import {
  EventDetail,
  EventListItem,
  ApiListResponse,
  CreateEventPayload,
  UpdateEventPayload,
} from "./types";

export interface ListEventsParams {
  is_featured?: 0 | 1;
  type_id?: number;
  category_id?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export async function listEvents(
  params: ListEventsParams = {},
): Promise<EventListItem[]> {
  const { items } = await apiRequest<ApiListResponse<EventListItem>>(
    "/events",
    { query: params },
  );
  return items;
}

export function getEvent(
  id: number | string,
  include?: string,
): Promise<EventDetail> {
  return apiRequest<EventDetail>(`/events/${id}`, {
    query: include ? { include } : undefined,
  });
}

export function createEvent(
  payload: CreateEventPayload,
): Promise<EventDetail> {
  return apiRequest<EventDetail>("/events", {
    method: "POST",
    body: payload,
  });
}

export function updateEvent(
  id: number | string,
  payload: UpdateEventPayload,
): Promise<EventDetail> {
  return apiRequest<EventDetail>(`/events/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteEvent(id: number | string): Promise<void> {
  return apiRequest<void>(`/events/${id}`, { method: "DELETE" });
}

export function assignCategory(
  eventId: number | string,
  categoryId: number | string,
): Promise<unknown> {
  return apiRequest(`/events/${eventId}/categories/${categoryId}`, {
    method: "POST",
  });
}

export function removeCategory(
  eventId: number | string,
  categoryId: number | string,
): Promise<unknown> {
  return apiRequest(`/events/${eventId}/categories/${categoryId}`, {
    method: "DELETE",
  });
}

import { apiRequest } from "./client";
import {
  CategoryLookup,
  EventTypeLookup,
  ApiListResponse,
  EventModeLookup,
  ApiStatus,
} from "./types";

// Reference data — static for the life of the tab, so fetch once and cache.
let eventTypesCache: Promise<EventTypeLookup[]> | null = null;
let statusesCache: Promise<ApiStatus[]> | null = null;
let modesCache: Promise<EventModeLookup[]> | null = null;
let categoriesCache: Promise<CategoryLookup[]> | null = null;

export function getEventTypes(): Promise<EventTypeLookup[]> {
  eventTypesCache ??= apiRequest<ApiListResponse<EventTypeLookup>>(
    "/lookups/event-types",
  ).then((r) => r.items);
  return eventTypesCache;
}

export function getStatuses(): Promise<ApiStatus[]> {
  statusesCache ??= apiRequest<ApiListResponse<ApiStatus>>(
    "/lookups/statuses",
  ).then((r) => r.items);
  return statusesCache;
}

export function getModes(): Promise<EventModeLookup[]> {
  modesCache ??= apiRequest<ApiListResponse<EventModeLookup>>(
    "/lookups/modes",
  ).then((r) => r.items);
  return modesCache;
}

export function getCategories(): Promise<CategoryLookup[]> {
  categoriesCache ??= apiRequest<ApiListResponse<CategoryLookup>>(
    "/lookups/categories",
  ).then((r) => r.items);
  return categoriesCache;
}

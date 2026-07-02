import { getEventById, MockEvent } from "./mock-events";

const organizedEvents: MockEvent[] = [];
const eventDrafts = new Map<string, unknown>();

export function getOrganizedEvents(): MockEvent[] {
  return organizedEvents;
}

export function getOrganizedEventById(id: string): MockEvent | undefined {
  return organizedEvents.find((event) => event.id === id);
}

export function getAnyEventById(id: string): MockEvent | undefined {
  return getOrganizedEventById(id) ?? getEventById(id);
}

export function addOrganizedEvent(event: MockEvent): void {
  organizedEvents.push(event);
}

export function updateOrganizedEvent(
  id: string,
  updates: Partial<MockEvent>,
): MockEvent | undefined {
  const event = getOrganizedEventById(id);
  if (!event) return undefined;
  Object.assign(event, updates, { id: event.id });
  return event;
}

export function cancelOrganizedEvent(id: string): MockEvent | undefined {
  return updateOrganizedEvent(id, { status: "cancelled" });
}

export function saveEventDraft<T>(id: string, draft: T): void {
  eventDrafts.set(id, draft);
}

export function getEventDraft<T>(id: string): T | undefined {
  return eventDrafts.get(id) as T | undefined;
}

export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "event"}-${Date.now()}`;
}

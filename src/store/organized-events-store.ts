import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getEventById, MockEvent, mockEvents } from "@/lib/mock-events";

interface OrganizedEventsState {
  events: MockEvent[];
  drafts: Record<string, unknown>;
}

interface OrganizedEventsActions {
  addEvent: (event: MockEvent) => void;
  updateEvent: (
    id: string,
    updates: Partial<MockEvent>,
  ) => MockEvent | undefined;
  cancelEvent: (id: string) => MockEvent | undefined;
  saveDraft: <T>(id: string, draft: T) => void;
  getDraft: <T>(id: string) => T | undefined;
}

export const useOrganizedEventsStore = create<
  OrganizedEventsState & OrganizedEventsActions
>()(
  devtools(
    (set, get) => ({
      events: [...mockEvents],
      drafts: {},

      addEvent: (event) =>
        set(
          (state) => ({ events: [...state.events, event] }),
          false,
          "addEvent",
        ),

      updateEvent: (id, updates) => {
        let updated: MockEvent | undefined;
        set(
          (state) => ({
            events: state.events.map((event) => {
              if (event.id !== id) return event;
              updated = { ...event, ...updates, id: event.id };
              return updated;
            }),
          }),
          false,
          "updateEvent",
        );
        return updated;
      },

      cancelEvent: (id) => get().updateEvent(id, { status: "cancelled" }),

      saveDraft: <T>(id: string, draft: T) =>
        set(
          (state) => ({ drafts: { ...state.drafts, [id]: draft } }),
          false,
          "saveDraft",
        ),

      getDraft: <T>(id: string) => get().drafts[id] as T | undefined,
    }),
    {
      name: "organized-events-store",
      enabled: process.env.NODE_ENV !== "production",
    },
  ),
);

export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "event"}-${Date.now()}`;
}

export function getAnyEventById(id: string): MockEvent | undefined {
  return (
    useOrganizedEventsStore
      .getState()
      .events.find((event) => event.id === id) ?? getEventById(id)
  );
}

export function useAnyEventById(id: string): MockEvent | undefined {
  const organizedEvent = useOrganizedEventsStore((state) =>
    state.events.find((event) => event.id === id),
  );
  return organizedEvent ?? getEventById(id);
}

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Attendee } from "@/lib/attendees";

export type AttendeesFilterValue =
  "all" | "paid" | "free" | "attended" | "missed";

interface AttendeesTabState {
  query: string;
  filter: AttendeesFilterValue;
  page: number;
  viewingAttendee: Attendee | null;
}

interface AttendeesTabActions {
  setQuery: (query: string) => void;
  setFilter: (filter: AttendeesFilterValue) => void;
  setPage: (page: number) => void;
  setViewingAttendee: (attendee: Attendee | null) => void;
}

export const useAttendeesTabStore = create<
  AttendeesTabState & AttendeesTabActions
>()(
  devtools(
    (set) => ({
      query: "",
      filter: "all",
      page: 1,
      viewingAttendee: null,

      setQuery: (query) => set({ query }, false, "setQuery"),
      setFilter: (filter) => set({ filter }, false, "setFilter"),
      setPage: (page) => set({ page }, false, "setPage"),
      setViewingAttendee: (attendee) =>
        set({ viewingAttendee: attendee }, false, "setViewingAttendee"),
    }),
    {
      name: "attendees-tab-store",
      enabled: process.env.NODE_ENV !== "production",
    },
  ),
);

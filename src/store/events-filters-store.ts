import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface EventsFiltersState {
  activeTab: string;
  activeFilters: string[];
}

interface EventsFiltersActions {
  setActiveTab: (tab: string) => void;
  toggleFilter: (filter: string) => void;
}

export const useEventsFiltersStore = create<
  EventsFiltersState & EventsFiltersActions
>()(
  devtools(
    (set) => ({
      activeTab: "all",
      activeFilters: [],

      setActiveTab: (tab) => set({ activeTab: tab }, false, "setActiveTab"),

      toggleFilter: (filter) =>
        set(
          (state) => ({
            activeFilters: state.activeFilters.includes(filter)
              ? state.activeFilters.filter((f) => f !== filter)
              : [...state.activeFilters, filter],
          }),
          false,
          "toggleFilter",
        ),
    }),
    {
      name: "events-filters-store",
      enabled: process.env.NODE_ENV !== "production",
    },
  ),
);

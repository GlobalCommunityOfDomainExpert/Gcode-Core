import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface MyEventsFiltersState {
  activeTab: string;
  range: string;
}

interface MyEventsFiltersActions {
  setActiveTab: (tab: string) => void;
  setRange: (range: string) => void;
}

export const useMyEventsFiltersStore = create<
  MyEventsFiltersState & MyEventsFiltersActions
>()(
  devtools(
    (set) => ({
      activeTab: "upcoming",
      range: "week",

      setActiveTab: (tab) => set({ activeTab: tab }, false, "setActiveTab"),
      setRange: (range) => set({ range }, false, "setRange"),
    }),
    {
      name: "my-events-filters-store",
      enabled: process.env.NODE_ENV !== "production",
    },
  ),
);

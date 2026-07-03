import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { StakeholderCategory } from "@/lib/community-requests";
import { SelectedStakeholder } from "@/app/(app)/my-organized-events/_components/types";

interface CommunityTabState {
  categoryFilter: StakeholderCategory | "all";
  selectedIds: Set<string>;
  showRequestModal: boolean;
  pendingSelection: SelectedStakeholder[];
}

interface CommunityTabActions {
  setCategoryFilter: (filter: StakeholderCategory | "all") => void;
  setSelectedIds: (ids: Set<string>) => void;
  setShowRequestModal: (open: boolean) => void;
  setPendingSelection: (selection: SelectedStakeholder[]) => void;
}

export const useCommunityTabStore = create<
  CommunityTabState & CommunityTabActions
>()(
  devtools(
    (set) => ({
      categoryFilter: "all",
      selectedIds: new Set(),
      showRequestModal: false,
      pendingSelection: [],

      setCategoryFilter: (filter) =>
        set({ categoryFilter: filter }, false, "setCategoryFilter"),
      setSelectedIds: (ids) =>
        set({ selectedIds: ids }, false, "setSelectedIds"),
      setShowRequestModal: (open) =>
        set({ showRequestModal: open }, false, "setShowRequestModal"),
      setPendingSelection: (selection) =>
        set({ pendingSelection: selection }, false, "setPendingSelection"),
    }),
    {
      name: "community-tab-store",
      enabled: process.env.NODE_ENV !== "production",
    },
  ),
);

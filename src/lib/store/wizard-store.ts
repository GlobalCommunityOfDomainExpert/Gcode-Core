import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  initialEventData,
  SelectedStakeholder,
  eventDetailDataSchema,
  EventDetailData,
} from "@/lib/zod/event";

interface WizardState {
  stepIndex: number;
  data: EventDetailData;
  selectedStakeholders: SelectedStakeholder[];
  submitting: boolean;
}

interface WizardActions {
  setStep: (index: number) => void;
  update: <K extends keyof EventDetailData>(
    key: K,
    value: EventDetailData[K],
  ) => void;
  setSelectedStakeholders: (selected: SelectedStakeholder[]) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: (initialData?: EventDetailData) => void;
}

export const useWizardStore = create<WizardState & WizardActions>()(
  devtools(
    (set) => ({
      stepIndex: 0,
      data: initialEventData,
      selectedStakeholders: [],
      submitting: false,

      setStep: (index) => set({ stepIndex: index }, false, "setStep"),

      update: (key, value) =>
        set(
          (state) => ({ data: { ...state.data, [key]: value } }),
          false,
          "update",
        ),

      setSelectedStakeholders: (selected) =>
        set(
          { selectedStakeholders: selected },
          false,
          "setSelectedStakeholders",
        ),

      setSubmitting: (submitting) =>
        set({ submitting }, false, "setSubmitting"),

      reset: (initialData) =>
        set(
          {
            stepIndex: 0,
            data: initialData
              ? eventDetailDataSchema.parse(initialData)
              : initialEventData,
            selectedStakeholders: [],
            submitting: false,
          },
          false,
          "reset",
        ),
    }),
    {
      name: "wizard-store",
      enabled: process.env.NODE_ENV !== "production",
    },
  ),
);

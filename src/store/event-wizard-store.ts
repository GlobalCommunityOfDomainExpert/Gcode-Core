import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  initialWizardData,
  SelectedStakeholder,
  WizardData,
} from "@/app/(app)/my-organized-events/_components/types";

interface EventWizardState {
  stepIndex: number;
  data: WizardData;
  selectedStakeholders: SelectedStakeholder[];
  submitting: boolean;
}

interface EventWizardActions {
  setStep: (index: number) => void;
  update: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
  setSelectedStakeholders: (selected: SelectedStakeholder[]) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: (initialData?: WizardData) => void;
}

export const useEventWizardStore = create<
  EventWizardState & EventWizardActions
>()(
  devtools(
    (set) => ({
      stepIndex: 0,
      data: initialWizardData,
      selectedStakeholders: [],
      submitting: false,

      setStep: (index) => set({ stepIndex: index }, false, "setStep"),

      update: <K extends keyof WizardData>(key: K, value: WizardData[K]) =>
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
            data: initialData ?? initialWizardData,
            selectedStakeholders: [],
            submitting: false,
          },
          false,
          "reset",
        ),
    }),
    {
      name: "event-wizard-store",
      enabled: process.env.NODE_ENV !== "production",
    },
  ),
);

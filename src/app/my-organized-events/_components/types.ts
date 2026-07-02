import { EventType } from "@/lib/mock-events";
import { StakeholderCategory } from "@/lib/community-requests";

export interface WizardData {
  type: EventType | null;
  title: string;
  description: string;
  price: "Free" | "Paid";
  priceAmount: string;
  capacity: string;
  certificate: boolean;
  mode: "Online" | "In-Person" | "Hybrid";
  date: string;
  time: string;
  location: string;
  registrationCloses: string;
  duration: string;
}

export type UpdateWizardData = <K extends keyof WizardData>(
  key: K,
  value: WizardData[K],
) => void;

export interface SelectedStakeholder {
  stakeholderId: string;
  category: StakeholderCategory;
  message: string;
}

export const initialWizardData: WizardData = {
  type: null,
  title: "",
  description: "",
  price: "Free",
  priceAmount: "",
  capacity: "",
  certificate: false,
  mode: "Online",
  date: "",
  time: "",
  location: "",
  registrationCloses: "",
  duration: "",
};

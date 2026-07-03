import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { CommunicationLog } from "@/lib/communications";

interface CommunicationsState {
  logs: CommunicationLog[];
  commCounter: number;
}

interface CommunicationsActions {
  addLog: (input: Omit<CommunicationLog, "id" | "sentAt">) => CommunicationLog;
}

const seedLogs: CommunicationLog[] = [
  {
    id: "comm-1",
    eventId: "gcode-build-sprint-2026",
    subject: "Registration confirmation",
    message:
      "Hi there, thanks for registering for GCODE Build Sprint · Summer 2026!",
    sentAt: "2026-06-29T16:22:00.000Z",
    recipientCount: 148,
    openRate: 92,
  },
  {
    id: "comm-2",
    eventId: "gcode-build-sprint-2026",
    subject: "Event is now Live!",
    message: "GCODE Build Sprint · Summer 2026 has started — join in now.",
    sentAt: "2026-07-01T10:00:00.000Z",
    recipientCount: 148,
    openRate: 78,
  },
];

export const useCommunicationsStore = create<
  CommunicationsState & CommunicationsActions
>()(
  devtools(
    (set, get) => ({
      logs: seedLogs,
      commCounter: seedLogs.length,

      addLog: (input) => {
        const counter = get().commCounter + 1;
        const log: CommunicationLog = {
          id: `comm-${counter}`,
          sentAt: new Date().toISOString(),
          ...input,
        };
        set(
          (state) => ({ logs: [...state.logs, log], commCounter: counter }),
          false,
          "addLog",
        );
        return log;
      },
    }),
    {
      name: "communications-store",
      enabled: process.env.NODE_ENV !== "production",
    },
  ),
);

function sortByRecent(logs: CommunicationLog[]): CommunicationLog[] {
  return [...logs].sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));
}

export function getCommunicationLogsByEvent(
  eventId: string,
): CommunicationLog[] {
  return sortByRecent(
    useCommunicationsStore
      .getState()
      .logs.filter((log) => log.eventId === eventId),
  );
}

export function useCommunicationLogsByEvent(
  eventId: string,
): CommunicationLog[] {
  return useCommunicationsStore(
    useShallow((state) =>
      sortByRecent(state.logs.filter((log) => log.eventId === eventId)),
    ),
  );
}

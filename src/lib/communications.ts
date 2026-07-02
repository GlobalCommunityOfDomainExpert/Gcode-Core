export interface CommunicationLog {
  id: string;
  eventId: string;
  subject: string;
  message: string;
  sentAt: string;
  recipientCount: number;
  openRate?: number;
}

const communicationLogs: CommunicationLog[] = [
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

let commCounter = communicationLogs.length;

export function getCommunicationLogsByEvent(
  eventId: string,
): CommunicationLog[] {
  return communicationLogs
    .filter((log) => log.eventId === eventId)
    .sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));
}

export function addCommunicationLog(
  input: Omit<CommunicationLog, "id" | "sentAt">,
): CommunicationLog {
  commCounter += 1;
  const log: CommunicationLog = {
    id: `comm-${commCounter}`,
    sentAt: new Date().toISOString(),
    ...input,
  };
  communicationLogs.push(log);
  return log;
}

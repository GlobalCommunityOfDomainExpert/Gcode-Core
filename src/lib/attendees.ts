export type AttendeeRole =
  | "Fresher"
  | "Startup Founder"
  | "Domain Expert"
  | "Institution"
  | "Guest";
export type AttendanceStatus =
  "registered" | "attended" | "missed" | "cancelled";

export interface Attendee {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string | null;
  avatarInitials: string;
  role: AttendeeRole;
  ticketType: "Free" | "Paid";
  quantity?: number; // ticket count for this registration; unset defaults to 1
  amountPaid?: number;
  status: AttendanceStatus;
  registeredAt: string;
  category: "Attendee" | "Participant";
  // Only ever set for category "Participant" — Attendee passes have no
  // additional-info submission step.
  audioSubmissionUrl?: string | null;
  audioSubmittedOn?: string | null;
}

// Matches additional-info/page.tsx's own 24h window — kept as a separate
// constant here since that page computes its own live countdown and this
// one just needs a point-in-time status for the organizer's table.
export const AUDIO_SUBMISSION_WINDOW_MS = 24 * 60 * 60 * 1000;

export type SubmissionStatus = "submitted" | "pending" | "disqualified";

// undefined -> not a Participant-category row, submission concept doesn't apply.
export function audioSubmissionStatus(
  attendee: Attendee,
  now: Date = new Date(),
): SubmissionStatus | undefined {
  if (attendee.category !== "Participant") return undefined;
  if (attendee.audioSubmissionUrl) return "submitted";
  const deadline =
    new Date(attendee.registeredAt).getTime() + AUDIO_SUBMISSION_WINDOW_MS;
  return now.getTime() > deadline ? "disqualified" : "pending";
}

export function attendeesCsvRows(attendees: Attendee[]): string[][] {
  return attendees.map((attendee) => [
    attendee.name,
    attendee.email,
    attendee.role,
    attendee.category,
    new Date(attendee.registeredAt).toLocaleDateString("en-IN"),
    attendee.ticketType,
    String(attendee.quantity ?? 1),
    attendee.status,
  ]);
}

export const ATTENDEES_CSV_HEADERS = [
  "Name",
  "Email",
  "Role",
  "Category",
  "Registered",
  "Payment",
  "Tickets",
  "Status",
];

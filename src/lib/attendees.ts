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
  avatarInitials: string;
  role: AttendeeRole;
  ticketType: "Free" | "Paid";
  quantity?: number; // ticket count for this registration; unset in mock data, defaults to 1
  amountPaid?: number;
  status: AttendanceStatus;
  registeredAt: string;
}

export const mockAttendees: Attendee[] = [
  // gcode-build-sprint-2026 — spread across the last 7 days (today: 2026-07-02)
  {
    id: "att-1",
    eventId: "gcode-build-sprint-2026",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    avatarInitials: "PS",
    role: "Fresher",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-06-26T09:00:00.000Z",
  },
  {
    id: "att-2",
    eventId: "gcode-build-sprint-2026",
    name: "Rahul Verma",
    email: "rahul.verma@example.com",
    avatarInitials: "RV",
    role: "Domain Expert",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-06-27T11:30:00.000Z",
  },
  {
    id: "att-3",
    eventId: "gcode-build-sprint-2026",
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    avatarInitials: "AI",
    role: "Startup Founder",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-06-27T14:15:00.000Z",
  },
  {
    id: "att-4",
    eventId: "gcode-build-sprint-2026",
    name: "Vikram Nair",
    email: "vikram.nair@example.com",
    avatarInitials: "VN",
    role: "Fresher",
    ticketType: "Free",
    status: "cancelled",
    registeredAt: "2026-06-28T08:00:00.000Z",
  },
  {
    id: "att-5",
    eventId: "gcode-build-sprint-2026",
    name: "Sneha Kapoor",
    email: "sneha.kapoor@example.com",
    avatarInitials: "SK",
    role: "Institution",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-06-28T16:45:00.000Z",
  },
  {
    id: "att-11",
    eventId: "gcode-build-sprint-2026",
    name: "Aarav Chopra",
    email: "aarav.chopra@example.com",
    avatarInitials: "AC",
    role: "Fresher",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-06-29T10:05:00.000Z",
  },
  {
    id: "att-12",
    eventId: "gcode-build-sprint-2026",
    name: "Ishita Bhatt",
    email: "ishita.bhatt@example.com",
    avatarInitials: "IB",
    role: "Startup Founder",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-06-29T13:40:00.000Z",
  },
  {
    id: "att-13",
    eventId: "gcode-build-sprint-2026",
    name: "Dev Patel",
    email: "dev.patel@example.com",
    avatarInitials: "DP",
    role: "Domain Expert",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-06-29T18:20:00.000Z",
  },
  {
    id: "att-14",
    eventId: "gcode-build-sprint-2026",
    name: "Naina Joshi",
    email: "naina.joshi@example.com",
    avatarInitials: "NJ",
    role: "Fresher",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-06-30T09:15:00.000Z",
  },
  {
    id: "att-15",
    eventId: "gcode-build-sprint-2026",
    name: "Kabir Singh",
    email: "kabir.singh@example.com",
    avatarInitials: "KS",
    role: "Institution",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-06-30T12:50:00.000Z",
  },
  {
    id: "att-16",
    eventId: "gcode-build-sprint-2026",
    name: "Riya Desai",
    email: "riya.desai@example.com",
    avatarInitials: "RD",
    role: "Fresher",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-06-30T20:00:00.000Z",
  },
  {
    id: "att-17",
    eventId: "gcode-build-sprint-2026",
    name: "Yash Kulkarni",
    email: "yash.kulkarni@example.com",
    avatarInitials: "YK",
    role: "Startup Founder",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-07-01T08:30:00.000Z",
  },
  {
    id: "att-18",
    eventId: "gcode-build-sprint-2026",
    name: "Tara Menon",
    email: "tara.menon@example.com",
    avatarInitials: "TM",
    role: "Domain Expert",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-07-01T11:10:00.000Z",
  },
  {
    id: "att-19",
    eventId: "gcode-build-sprint-2026",
    name: "Arnav Saxena",
    email: "arnav.saxena@example.com",
    avatarInitials: "AS",
    role: "Fresher",
    ticketType: "Free",
    status: "missed",
    registeredAt: "2026-07-01T15:45:00.000Z",
  },
  {
    id: "att-20",
    eventId: "gcode-build-sprint-2026",
    name: "Zara Khan",
    email: "zara.khan@example.com",
    avatarInitials: "ZK",
    role: "Institution",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-07-01T19:00:00.000Z",
  },
  {
    id: "att-21",
    eventId: "gcode-build-sprint-2026",
    name: "Mihir Kapadia",
    email: "mihir.kapadia@example.com",
    avatarInitials: "MK",
    role: "Fresher",
    ticketType: "Free",
    status: "attended",
    registeredAt: "2026-07-02T07:20:00.000Z",
  },
  {
    id: "att-22",
    eventId: "gcode-build-sprint-2026",
    name: "Anaya Bose",
    email: "anaya.bose@example.com",
    avatarInitials: "AB",
    role: "Startup Founder",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-07-02T09:00:00.000Z",
  },
  {
    id: "att-23",
    eventId: "gcode-build-sprint-2026",
    name: "Reyansh Malhotra",
    email: "reyansh.malhotra@example.com",
    avatarInitials: "RM",
    role: "Domain Expert",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-07-02T10:30:00.000Z",
  },

  // ask-me-anything-fundraising
  {
    id: "att-6",
    eventId: "ask-me-anything-fundraising",
    name: "Karthik Reddy",
    email: "karthik.reddy@example.com",
    avatarInitials: "KR",
    role: "Startup Founder",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-06-25T10:00:00.000Z",
  },
  {
    id: "att-7",
    eventId: "ask-me-anything-fundraising",
    name: "Meera Pillai",
    email: "meera.pillai@example.com",
    avatarInitials: "MP",
    role: "Fresher",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-06-26T12:20:00.000Z",
  },
  {
    id: "att-8",
    eventId: "ask-me-anything-fundraising",
    name: "Arjun Malhotra",
    email: "arjun.malhotra@example.com",
    avatarInitials: "AM",
    role: "Domain Expert",
    ticketType: "Free",
    status: "registered",
    registeredAt: "2026-06-27T09:10:00.000Z",
  },

  // fundraising-readiness-webinar — paid event
  {
    id: "att-9",
    eventId: "fundraising-readiness-webinar",
    name: "Divya Menon",
    email: "divya.menon@example.com",
    avatarInitials: "DM",
    role: "Startup Founder",
    ticketType: "Paid",
    amountPaid: 299,
    status: "registered",
    registeredAt: "2026-06-28T13:00:00.000Z",
  },
  {
    id: "att-10",
    eventId: "fundraising-readiness-webinar",
    name: "Aditya Rao",
    email: "aditya.rao@example.com",
    avatarInitials: "AR",
    role: "Institution",
    ticketType: "Paid",
    amountPaid: 299,
    status: "registered",
    registeredAt: "2026-06-29T15:30:00.000Z",
  },
];

export function getAttendeesByEvent(eventId: string): Attendee[] {
  return mockAttendees.filter((attendee) => attendee.eventId === eventId);
}

export function attendeesCsvRows(attendees: Attendee[]): string[][] {
  return attendees.map((attendee) => [
    attendee.name,
    attendee.email,
    attendee.role,
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
  "Registered",
  "Payment",
  "Tickets",
  "Status",
];

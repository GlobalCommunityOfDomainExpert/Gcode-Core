export type EventType =
  | "Hackathon"
  | "Expert AMA"
  | "Webinar"
  | "Ideathon"
  | "Community Meetup"
  | "Institution Event";

export const eventTypeTone: Record<
  EventType,
  "primary" | "success" | "warning" | "danger" | "neutral"
> = {
  Hackathon: "primary",
  "Expert AMA": "warning",
  Webinar: "success",
  Ideathon: "danger",
  "Community Meetup": "neutral",
  "Institution Event": "primary",
};

export const eventTypeBorderClass: Record<EventType, string> = {
  Hackathon: "border-l-primary",
  "Expert AMA": "border-l-warning",
  Webinar: "border-l-success",
  Ideathon: "border-l-danger",
  "Community Meetup": "border-l-border-hover",
  "Institution Event": "border-l-primary",
};

export function formatDateBadge(date: string): { day: string; month: string } {
  const [day, month] = date.split(" ");
  return { day, month: month.toUpperCase() };
}

export interface EventAgendaItem {
  time: string;
  title: string;
  description: string;
}

export interface EventOrganizer {
  name: string;
  title: string;
  verified: boolean;
  eventsHosted: number;
  attendees: number;
}

export interface MockEvent {
  id: string;
  title: string;
  type: EventType;
  mode: "Online" | "In-Person" | "Hybrid";
  status?: "published" | "cancelled";
  price: "Free" | string;
  priceAmount?: number;
  date: string;
  time: string;
  location: string;
  registeredCount: number;
  interestedCount?: number;
  spotsLeft?: number;
  capacity?: number;
  featured?: boolean;
  registrationCloses: string;
  duration: string;
  teamSize: string;
  certificate: boolean;
  description: string[];
  agenda: EventAgendaItem[];
  organizer: EventOrganizer;
  terms: string[];
  tags?: string[];
}

export const mockEvents: MockEvent[] = [
  {
    id: "gcode-build-sprint-2026",
    title: "GCODE Build Sprint · Summer 2026",
    type: "Hackathon",
    mode: "Online",
    price: "Free",
    date: "15 Jul 2026",
    time: "10:00 AM – 6:00 PM IST",
    location: "Online · Link shared after registration",
    registeredCount: 148,
    spotsLeft: 52,
    capacity: 200,
    featured: true,
    tags: ["Hackathon", "Beginner Friendly"],
    registrationCloses: "14 Jul 2026",
    duration: "8 hours · Full-day event",
    teamSize: "1–4 members · Solo or team participation",
    certificate: true,
    description: [
      "A full-day build sprint for founders, engineers, and domain experts to ship a working prototype in a single day.",
      "Teams of up to 4 pick a track, get 30 minutes of live expert office hours at noon, and demo their build for judging at 5 PM.",
    ],
    agenda: [
      {
        time: "10:00 AM",
        title: "Kickoff & Problem Statement",
        description: "Opening session, team registration, problem brief",
      },
      {
        time: "12:00 PM",
        title: "Expert Office Hours",
        description: "30-min live Q&A with domain experts",
      },
      {
        time: "4:00 PM",
        title: "Submissions Close",
        description: "Final project submission deadline",
      },
      {
        time: "5:00 PM",
        title: "Winners Announced",
        description: "Live judging + prize distribution",
      },
    ],
    organizer: {
      name: "GCODE Team",
      title: "GCODE Expert",
      verified: true,
      eventsHosted: 8,
      attendees: 1240,
    },
    terms: [
      "Open to all GCODE members — freshers, startup founders, and domain experts.",
      "Free event — no registration fee. Spot is confirmed on sign-up.",
      "Certificate issued to all participants who complete the full event.",
      "GCODE reserves the right to disqualify participants for code-of-conduct violations.",
    ],
  },
  {
    id: "ask-me-anything-fundraising",
    title: "Ask Me Anything: Fundraising for Deep-Tech Startups",
    type: "Expert AMA",
    mode: "Online",
    price: "Free",
    date: "18 Jul 2026",
    time: "6:00 PM IST",
    location: "Online · GCODE Live",
    registeredCount: 94,
    featured: true,
    registrationCloses: "17 Jul 2026",
    duration: "1 hour",
    teamSize: "Individual attendance",
    certificate: false,
    description: [
      "A live, unscripted AMA with a deep-tech investor covering what it actually takes to raise a seed round in 2026.",
    ],
    agenda: [
      {
        time: "6:00 PM",
        title: "Opening remarks",
        description: "Host introduction and format",
      },
      {
        time: "6:10 PM",
        title: "Live Q&A",
        description: "Audience questions, moderated",
      },
    ],
    organizer: {
      name: "GCODE Team",
      title: "GCODE Expert",
      verified: true,
      eventsHosted: 8,
      attendees: 1240,
    },
    terms: [
      "Open to all GCODE members.",
      "Free event — no registration fee.",
      "Recording shared with registered attendees after the session.",
    ],
  },
  {
    id: "fundraising-readiness-webinar",
    title: "Fundraising readiness: what investors check first",
    type: "Webinar",
    mode: "Online",
    price: "₹299",
    priceAmount: 299,
    date: "5 Jul 2026",
    time: "5:00 PM IST",
    location: "Online · Live + Recording",
    registeredCount: 17,
    featured: true,
    registrationCloses: "5 Jul 2026",
    duration: "45 minutes",
    teamSize: "Individual attendance",
    certificate: false,
    description: [
      "A practical walkthrough of the diligence checklist investors run before writing a term sheet.",
    ],
    agenda: [
      {
        time: "5:00 PM",
        title: "Session",
        description: "Live walkthrough + Q&A",
      },
    ],
    organizer: {
      name: "GCODE Team",
      title: "GCODE Expert",
      verified: true,
      eventsHosted: 8,
      attendees: 1240,
    },
    terms: [
      "Paid event — ₹299 per seat.",
      "Recording available for 30 days after the session.",
    ],
  },
  {
    id: "climatech-ideathon-2026",
    title: "ClimaTech Ideathon 2026",
    type: "Ideathon",
    mode: "In-Person",
    price: "Free",
    date: "20 Jul 2026",
    time: "9:00 AM IST",
    location: "Bangalore, India",
    registeredCount: 0,
    interestedCount: 67,
    spotsLeft: 8,
    registrationCloses: "18 Jul 2026",
    duration: "6 hours",
    teamSize: "2–5 members",
    certificate: true,
    description: [
      "A single-day ideathon for climate-tech concepts, judged by domain experts and VCs.",
    ],
    agenda: [
      {
        time: "9:00 AM",
        title: "Kickoff",
        description: "Track briefing and team formation",
      },
    ],
    organizer: {
      name: "GCODE Team",
      title: "GCODE Expert",
      verified: true,
      eventsHosted: 8,
      attendees: 1240,
    },
    terms: ["In-person attendance required.", "Free event — limited seats."],
  },
  {
    id: "gcode-founders-meetup-mumbai",
    title: "GCODE Founders Meetup · Mumbai",
    type: "Community Meetup",
    mode: "In-Person",
    price: "Free",
    date: "22 Jul 2026",
    time: "5:30 PM IST",
    location: "Mumbai, India",
    registeredCount: 0,
    interestedCount: 113,
    registrationCloses: "22 Jul 2026",
    duration: "2 hours",
    teamSize: "Individual attendance",
    certificate: false,
    description: [
      "An informal founder meetup — no talks, just networking over coffee.",
    ],
    agenda: [
      {
        time: "5:30 PM",
        title: "Doors open",
        description: "Networking begins",
      },
    ],
    organizer: {
      name: "GCODE Team",
      title: "GCODE Expert",
      verified: true,
      eventsHosted: 8,
      attendees: 1240,
    },
    terms: ["Free, in-person event.", "Limited to GCODE members."],
  },
  {
    id: "national-tech-symposium-2026",
    title: "National Tech Symposium 2026 — IIT Delhi",
    type: "Institution Event",
    mode: "In-Person",
    price: "₹200",
    priceAmount: 200,
    date: "25 Jul 2026",
    time: "9:00 AM IST",
    location: "New Delhi, India",
    registeredCount: 0,
    interestedCount: 204,
    registrationCloses: "23 Jul 2026",
    duration: "Full day",
    teamSize: "Individual attendance",
    certificate: true,
    description: [
      "A full-day symposium on emerging technology, hosted by IIT Delhi in partnership with GCODE.",
    ],
    agenda: [
      {
        time: "9:00 AM",
        title: "Inauguration",
        description: "Opening keynote",
      },
    ],
    organizer: {
      name: "GCODE Team",
      title: "GCODE Expert",
      verified: true,
      eventsHosted: 8,
      attendees: 1240,
    },
    terms: ["Paid entry — ₹200.", "Certificate issued to all attendees."],
  },
];

export function getEventById(id: string): MockEvent | undefined {
  return mockEvents.find((event) => event.id === id);
}

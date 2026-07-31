import z from "zod";

const eventTimelineItemSchema = z.object({
  date: z.string().default(""), // yyyy-mm-dd — enables multi-day agendas
  time: z.string(),
  endTime: z.string().default(""),
  title: z.string(),
  description: z.string(),
  location: z.string().default(""),
});

const eventSocialLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
});

const eventRoundRubricCriterionSchema = z.object({
  label: z.string().default(""),
  maxScore: z.number().default(10),
});

const eventRoundItemSchema = z.object({
  name: z.string().default(""),
  description: z.string().default(""),
  mode: z.enum(["ONLINE", "OFFLINE"]).default("OFFLINE"),
  // Organizer-defined judging criteria — optional, blank = judges just
  // Shortlist/Reject with no scored breakdown.
  rubric: z.array(eventRoundRubricCriterionSchema).default([]),
  // Auto-shortlist top N once every participant has a score for every
  // rubric criterion — 0 = disabled, decisions stay fully manual.
  shortlistCount: z.number().default(0),
  date: z.string().default(""), // yyyy-mm-dd
  startTime: z.string().default(""),
  endTime: z.string().default(""),
  // Live final-score blend weights — only meaningful for whichever round
  // resolves as "the" live round (last Offline round, see resolveLiveRound
  // in lib/rounds.ts). Percentages, not enforced to sum to 100 server-side.
  judgeWeight: z.number().default(70),
  audienceWeight: z.number().default(30),
});

export const eventDetailDataSchema = z.object({
  id: z.number().default(0),
  type: z.number().nullable().default(null), // FK -> EVENT_TYPE_ID
  title: z.string().default(""),
  description: z.string().default(""),
  priceAmount: z.number().default(0),
  capacity: z.number().default(0),
  // Attendee category display text — falls back to "Attendee" + no
  // description when blank. Price/capacity for this category are the
  // priceAmount/capacity fields above (Attendee is today's default category).
  attendeeLabel: z.string().default(""),
  attendeeDescription: z.string().default(""),
  // Per-pass max-tickets-per-booking cap — 0 = no cap, only capacity applies.
  attendeeMaxTicketsPerRegistration: z.number().default(0),
  participantMaxTicketsPerRegistration: z.number().default(0),
  // Independently toggleable, same as participantRegistrationEnabled below —
  // defaults true so a new event starts open, matching today's behavior.
  attendeeRegistrationEnabled: z.boolean().default(true),
  // Participant category — a second, independent registration category
  // (e.g. hackathon builders) the organizer can opt into per event.
  participantRegistrationEnabled: z.boolean().default(false),
  participantLabel: z.string().default(""),
  participantDescription: z.string().default(""),
  participantPriceAmount: z.number().default(0),
  participantCapacity: z.number().default(0),
  categoryIds: z.array(z.number()).default([]), // FK -> EVENT_CATEGORIES.ID, via EVENT_CATEGORY_MAP
  terms: z.string().default(""), // one point per line; blank -> UI shows defaults
  eligibility: z.string().default(""), // one point per line; blank -> UI shows defaults
  mode: z.number().default(1), // FK -> MODE_OF_EVENT_ID
  date: z.string().default(""),
  time: z.string().default(""),
  location: z.string().default(""), // venue address (Physical/Hybrid)
  city: z.string().default(""), // GCODE_EVENTS2.CITY
  participationLink: z.string().default(""), // GCODE_EVENTS2.PARTICIPATION_LINK — online meeting link
  // Per-pass registration window — each category opens/closes independently.
  attendeeRegistrationOpens: z.string().default(""),
  attendeeRegistrationCloses: z.string().default(""),
  participantRegistrationOpens: z.string().default(""),
  participantRegistrationCloses: z.string().default(""),
  duration: z.string().default(""), // no backend column yet — derive from date/time later
  coverImageUrl: z.string().default(""), // local blob preview, uploaded via UPLOAD_COVER_IMAGE
  mediaUrls: z.array(z.string()).default([]), // no backend column yet
  socialLinks: z.array(eventSocialLinkSchema).default([]), // no backend column yet
  timeline: z.array(eventTimelineItemSchema).default([]), // EVENT_TIMELINE rows
  rounds: z.array(eventRoundItemSchema).default([]), // GCODE_EVENT_ROUNDS rows — contract-only as of 2026-07-25
  certificate: z.boolean().default(false), // no backend column yet
});

export type EventDetailData = z.infer<typeof eventDetailDataSchema>;

export type UpdateEventDetailData = <K extends keyof EventDetailData>(
  key: K,
  value: EventDetailData[K],
) => void;

export const initialEventData: EventDetailData = eventDetailDataSchema.parse(
  {},
);

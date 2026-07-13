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

export const eventDetailDataSchema = z.object({
  id: z.number().default(0),
  type: z.number().nullable().default(null), // FK -> EVENT_TYPE_ID
  title: z.string().default(""),
  description: z.string().default(""),
  priceAmount: z.number().default(0),
  capacity: z.number().default(0),
  maxTicketsPerRegistration: z.number().default(0), // 0 = no per-booking cap, only capacity applies
  categoryIds: z.array(z.number()).default([]), // FK -> EVENT_CATEGORIES.ID, via EVENT_CATEGORY_MAP
  terms: z.string().default(""), // one point per line; blank -> UI shows defaults
  eligibility: z.string().default(""), // one point per line; blank -> UI shows defaults
  mode: z.number().default(1), // FK -> MODE_OF_EVENT_ID
  date: z.string().default(""),
  time: z.string().default(""),
  location: z.string().default(""), // venue address (Physical/Hybrid)
  city: z.string().default(""), // GCODE_EVENTS2.CITY
  participationLink: z.string().default(""), // GCODE_EVENTS2.PARTICIPATION_LINK — online meeting link
  registrationCloses: z.string().default(""), // no backend column yet
  duration: z.string().default(""), // no backend column yet — derive from date/time later
  coverImageUrl: z.string().default(""), // local blob preview, uploaded via UPLOAD_COVER_IMAGE
  mediaUrls: z.array(z.string()).default([]), // no backend column yet
  socialLinks: z.array(eventSocialLinkSchema).default([]), // no backend column yet
  timeline: z.array(eventTimelineItemSchema).default([]), // EVENT_TIMELINE rows
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

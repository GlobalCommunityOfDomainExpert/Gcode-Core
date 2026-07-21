import { apiRequest } from "./client";

export interface LivePerformer {
  participant_id: number | null;
  participant_name: string | null;
  // Only meaningful when `attendeeId` was passed — whether *this* attendee
  // has already rated the current performer, so a page refresh reflects the
  // lock instead of relying on client-only state.
  already_rated: boolean;
  // ISO timestamp — the 60s rating window for the current performer closes
  // at this instant. Null when no performer is currently set.
  window_closes_at: string | null;
  // Live average across all ratings so far for the current performer,
  // already scaled to out-of-100 (avg of 0-10 ratings * 10). Null until the
  // first rating comes in.
  avg_rating: number | null;
  rating_count: number;
}

export interface PerformedParticipant {
  participant_id: number;
  performed_at: string;
}

// Public — the attendee's page polls/streams this to know who's performing.
// Pass the caller's own attendee id to also get back `already_rated`.
export function getLivePerformer(
  eventId: number | string,
  attendeeId?: number | string,
): Promise<LivePerformer> {
  return apiRequest(`/events/${eventId}/live-performer`, {
    query: attendeeId !== undefined ? { attendee_id: attendeeId } : undefined,
  });
}

// Organizer-only — brings a Participant-category row "on stage" (sets who's
// currently performing) without opening the audience rating window. That's
// a separate, explicit step — see startRatingWindow below.
export function setLivePerformer(
  eventId: number | string,
  participantId: number | string,
): Promise<LivePerformer> {
  return apiRequest(`/events/${eventId}/live-performer`, {
    method: "PUT",
    body: { participant_id: participantId },
  });
}

// Organizer-only — opens the 60s audience rating window for whoever is
// currently on stage.
export function startRatingWindow(
  eventId: number | string,
): Promise<LivePerformer> {
  return apiRequest(`/events/${eventId}/live-performer/start-rating`, {
    method: "PUT",
    body: {},
  });
}

// Public — `attendeeId` is the caller's own participant id (guest-token
// model, same trust level as audio-submission). Fails with "already rated"
// if this attendee has already rated this performer — that's the lock.
export function submitRating(
  attendeeId: number | string,
  performerId: number | string,
  rating: number,
): Promise<{ created_on: string }> {
  return apiRequest(`/participants/${attendeeId}/rating`, {
    method: "PUT",
    body: { performer_id: performerId, rating },
  });
}

// Organizer-only — bulk-emails every Attendee-category registration their
// unique rating link.
export function sendRatingLinks(
  eventId: number | string,
): Promise<{ sent: number }> {
  return apiRequest(`/events/${eventId}/send-rating-links`, {
    method: "POST",
    body: {},
  });
}

// Organizer-only — every Participant-category row that has been marked as
// the current performer at least once (drives the Live tab's "Performed"
// badge, distinct from "Now performing").
export async function getPerformedParticipants(
  eventId: number | string,
): Promise<PerformedParticipant[]> {
  const { items } = await apiRequest<{ items: PerformedParticipant[] }>(
    `/events/${eventId}/performed-participants`,
  );
  return items;
}

// Casual mode's fixed emoji set — not configurable per event. Shared by the
// rate page's tap buttons, the bot simulator, and (implicitly) the
// GCODE_EVENT_REACTIONS.EMOJI check constraint on the backend.
export const REACTION_EMOJIS = ["👏", "🔥", "❤️", "😂", "👍"] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export interface ReactionItem {
  id: number;
  emoji: string;
}

// Public — unlimited taps, no lock, fire-and-forget from the caller's
// perspective. `attendeeId` is the tapping attendee's own participant id —
// same shape as submitRating (rater in the path, performer in the body),
// event_id resolved server-side from the participant rows, not client-sent.
export function submitReaction(
  attendeeId: number | string,
  performerId: number | string,
  emoji: string,
): Promise<{ ok: boolean }> {
  return apiRequest(`/participants/${attendeeId}/reactions`, {
    method: "PUT",
    body: { performer_id: performerId, emoji },
  });
}

// Server-side only — called from the reactions SSE stream route, not from
// any client component. Append-only read: every reaction for this performer
// with id > sinceId, oldest first.
export async function listReactionsSince(
  eventId: number | string,
  performerId: number | string,
  sinceId: number,
): Promise<ReactionItem[]> {
  const { items } = await apiRequest<{ items: ReactionItem[] }>(
    `/events/${eventId}/reactions/since`,
    { query: { performer_id: performerId, since_id: sinceId } },
  );
  return items;
}

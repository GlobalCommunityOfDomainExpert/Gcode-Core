import { apiRequest } from "./client";
import {
  ApiListResponse,
  EventRoundApi,
  RoundDecisionApi,
  RoundScoreApi,
} from "./types";
import { RoundPayloadItem } from "./adapters";
import { getSession } from "@/lib/auth/session";

// Contract-only — see the EventRoundApi comment in types.ts. Full-replace
// child collection, mirrors listEventTimeline/replaceEventTimeline in
// events.ts. GCODE_EVENT_ROUNDS/the /rounds endpoint don't exist on the live
// backend yet, so this degrades to [] instead of throwing into whatever
// Promise.all it's called from (see project memory
// "contract-first-ords-endpoints" — an uncaught 404 here broke every event
// detail page for an earlier feature built the same way).
export async function listEventRounds(
  eventId: number | string,
): Promise<EventRoundApi[]> {
  try {
    const { items } = await apiRequest<ApiListResponse<EventRoundApi>>(
      `/events/${eventId}/rounds`,
    );
    return items;
  } catch {
    return [];
  }
}

// No-op until the backend endpoint exists — same degrade convention as
// listEventRounds above. The wizard should still let organizers fill in
// rounds locally without the save flow blowing up on every event.
export async function replaceEventRounds(
  eventId: number | string,
  items: RoundPayloadItem[],
): Promise<unknown> {
  try {
    return await apiRequest(`/events/${eventId}/rounds`, {
      method: "POST",
      body: items,
    });
  } catch {
    return undefined;
  }
}

// Contract-only — see RoundDecisionApi comment in types.ts. Mirrors
// submitParticipantAgeCategory's PUT shape/error convention. decided_by is
// sent straight from the organizer's own session — this backend doesn't
// verify bearer tokens server-side at all (confirmed: the Authorization
// header never reaches ORDS's PL/SQL CGI environment here, and the real
// create_participant handler trusts a client-supplied user id the same
// way), so there's no point pretending otherwise on this endpoint either.
export function decideRoundStatus(
  participantId: number | string,
  roundId: number | string,
  status: "SHORTLISTED" | "REJECTED",
): Promise<RoundDecisionApi> {
  const decidedBy = getSession()?.userId ?? "";
  return apiRequest(`/participants/${participantId}/round-status`, {
    method: "PUT",
    body: { round_id: roundId, status, decided_by: decidedBy },
  });
}

// Organizer-only — full decision history for an event, optionally scoped to
// one round. Mirrors getPerformedParticipants in ratings.ts. Degrades to []
// same as listEventRounds above — the Rounds tab is only ever rendered once
// event.rounds is non-empty, but this stays defensive regardless.
export async function listRoundDecisions(
  eventId: number | string,
  roundId?: number | string,
): Promise<RoundDecisionApi[]> {
  try {
    const { items } = await apiRequest<ApiListResponse<RoundDecisionApi>>(
      `/events/${eventId}/round-decisions`,
      { query: roundId !== undefined ? { round_id: roundId } : undefined },
    );
    return items;
  } catch {
    return [];
  }
}

// Contract-only — see RoundScoreApi comment in types.ts. Same
// client-supplied-scorer-id convention as decideRoundStatus above.
export function submitRoundScore(
  participantId: number | string,
  roundId: number | string,
  criterionId: number | string,
  score: number,
): Promise<RoundScoreApi> {
  const scoredBy = getSession()?.userId ?? "";
  return apiRequest(`/participants/${participantId}/round-score`, {
    method: "PUT",
    body: {
      round_id: roundId,
      criterion_id: criterionId,
      score,
      scored_by: scoredBy,
    },
  });
}

// Organizer-only — full score history for an event, optionally scoped to one
// round. Same degrade-to-[] convention as listRoundDecisions above.
export async function listRoundScores(
  eventId: number | string,
  roundId?: number | string,
): Promise<RoundScoreApi[]> {
  try {
    const { items } = await apiRequest<ApiListResponse<RoundScoreApi>>(
      `/events/${eventId}/round-scores`,
      { query: roundId !== undefined ? { round_id: roundId } : undefined },
    );
    return items;
  } catch {
    return [];
  }
}

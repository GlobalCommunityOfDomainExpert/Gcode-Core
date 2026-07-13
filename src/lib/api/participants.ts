import { apiRequest } from "./client";
import {
  ApiListResponse,
  CreateParticipantPayload,
  MyParticipationApi,
  ParticipantApi,
} from "./types";

// Guest registration: no sign-in required. Server finds-or-creates the
// GCODE_USERS row by email and links it to the new participant row.
export function registerForEvent(
  eventId: number | string,
  payload: CreateParticipantPayload,
): Promise<{ participant_id: number }> {
  return apiRequest(`/events/${eventId}/participants`, {
    method: "POST",
    body: payload,
  });
}

export async function listParticipants(
  eventId: number | string,
): Promise<ParticipantApi[]> {
  const { items } = await apiRequest<ApiListResponse<ParticipantApi>>(
    `/events/${eventId}/participants`,
  );
  return items;
}

export async function getParticipant(
  id: number | string,
): Promise<ParticipantApi | undefined> {
  const { items } = await apiRequest<{ items: ParticipantApi[] }>(
    `/participants/${id}`,
  );
  return items[0];
}

// Registrations for the signed-in user, joined to their events. Backend
// resolves user_id from the token itself (AUTH_PKG.get_verified_user_id) —
// this just carries the token as a query param, not the user_id.
export async function listMyParticipations(
  token: string,
): Promise<MyParticipationApi[]> {
  const { items } = await apiRequest<ApiListResponse<MyParticipationApi>>(
    "/participants/mine",
    { query: { p_token: token } },
  );
  return items;
}

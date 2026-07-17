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

// A hosted link (Google Drive share URL, etc.), not a binary upload — keeps
// this a plain JSON PUT instead of adding blob storage for large audio
// files. The ORDS handler only defines PUT for this template, not PATCH.
// Unlike the read-side degrade-to-default convention elsewhere in this
// file, a failure here must reach the caller — the participant needs to
// know their submission didn't save before the 24h deadline passes.
export function submitParticipantAudio(
  id: number | string,
  audioUrl: string,
): Promise<{ audio_submission_url: string; audio_submitted_on: string }> {
  return apiRequest(`/participants/${id}/audio-submission`, {
    method: "PUT",
    body: { audio_submission_url: audioUrl },
  });
}
